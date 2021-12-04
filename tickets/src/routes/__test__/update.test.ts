import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';

it('returns a 404 if the provided ID does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${fakeId}`)
        .set('Cookie', signin())
        .send({
            title: 'valid title',
            price: 10
        })
        .expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
    const fakeId = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${fakeId}`)
        .send({
            title: 'valid title',
            price: 10
        })
        .expect(401);
});

it('returns a 401 if the user does not own the ticket', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', signin())
        .send({
            title: 'valid title first',
            price: 10
        })
        .expect(201);

    const ticketId = response.body.id;
    await request(app)
        .put(`/api/tickets/${ticketId}`)
        .set('Cookie', signin())
        .send({
            title: 'valid title second',
            price: 10
        })
        .expect(401);
});

it('returns a 400 if the user provides an invalid title or price', async () => {
    const cookie = signin();
    
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'valid title first',
            price: 10
        })
        .expect(201);
    
    const ticketId = response.body.id;
    await request(app)
        .put(`/api/tickets/${ticketId}`)
        .set('Cookie', signin())
        .send({
            title: '',
            price: 10
        })
        .expect(400);
    
    await request(app)
        .put(`/api/tickets/${ticketId}`)
        .set('Cookie', cookie)
        .send({
            title: 'valid title second',
            price: -10
        })
        .expect(400);
});

it('successfully updates the ticket with valid inputs', async () => {
    const cookie = signin();
    
    const createTicketResponse = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'valid title first',
            price: 10
        })
        .expect(201);
    
    const ticketId = createTicketResponse.body.id;
    await request(app)
        .put(`/api/tickets/${ticketId}`)
        .set('Cookie', cookie)
        .send({
            title: 'valid title second',
            price: 15
        })
        .expect(200);
    
    const newTitle = 'valid title second';
    const newPrice = 15;
    const getTicketResponse = await request(app)
        .get(`/api/tickets/${ticketId}`)
        .set('Cookie', cookie)
        .send({
            title: newTitle,
            price: newPrice
        })
        .expect(200);
    expect(getTicketResponse.body.title).toEqual(newTitle);
    expect(getTicketResponse.body.price).toEqual(newPrice);
});

it('successfully publishes an event', async () => {
    const cookie = signin();
    
    const createTicketResponse = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'valid title first',
            price: 10
        })
        .expect(201);
    
    const ticketId = createTicketResponse.body.id;
    await request(app)
        .put(`/api/tickets/${ticketId}`)
        .set('Cookie', cookie)
        .send({
            title: 'valid title second',
            price: 15
        })
        .expect(200);
    
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('rejects update if the ticket is reserved', async () => {
    const cookie = signin();
    
    const createTicketResponse = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'valid title first',
            price: 10
        })
        .expect(201);
    
    const ticket = await Ticket.findById(createTicketResponse.body.id);
    ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
    await ticket!.save();
    
    const ticketId = createTicketResponse.body.id;
    await request(app)
        .put(`/api/tickets/${ticketId}`)
        .set('Cookie', cookie)
        .send({
            title: 'valid title second',
            price: 15
        })
        .expect(400);
});
