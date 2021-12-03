import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('has a route handler for POST /api/tickets', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .send({});
    expect(response.statusCode).not.toEqual(404);
});

it('can only be accessed by authenticated user', async () => {
    await request(app)
        .post('/api/tickets')
        .send({
            title: 'valid title',
            price: 15
        })
        .expect(401);
});

it('returns other than 401 if user is signed in', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', signin())
        .send({});
    expect(response.statusCode).not.toEqual(401);
});

it('returns an error if an invalid title is provided', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', signin())
        .send({
            title: '',
            price: 15
        })
        .expect(400);
    
    await request(app)
        .post('/api/tickets')
        .set('Cookie', signin())
        .send({
            price: 15
        })
        .expect(400);
});

it('returns an error if an invalid price is provided', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', signin())
        .send({
            title: 'valid title',
            price: -15
        })
        .expect(400);
    
    await request(app)
        .post('/api/tickets')
        .set('Cookie', signin())
        .send({
            title: 'valid title',
            price: 0
        })
        .expect(400);
    
    await request(app)
        .post('/api/tickets')
        .set('Cookie', signin())
        .send({
            title: 'valid title'
        })
        .expect(400);
});

it('successfully creates a ticket with valid inputs', async () => {
    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0);

    const title = 'valid title';
    const price = 15;

    await request(app)
        .post('/api/tickets')
        .set('Cookie', signin())
        .send({ title, price })
        .expect(201);
    
    tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);
    
    expect(tickets[0].title).toEqual(title);
    expect(tickets[0].price).toEqual(price);
});

it('successfully publishes an event', async () => {
    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0);

    const title = 'valid title';
    const price = 15;

    await request(app)
        .post('/api/tickets')
        .set('Cookie', signin())
        .send({ title, price })
        .expect(201);
    
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});
