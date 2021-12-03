import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

it('returns a 404 if the ticket is not found', async () => {
    const fakeId = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .get(`/api/tickets/${fakeId}`)
        .send()
        .expect(404);
});

it('returns the ticket if it exists in DB', async () => {
    const title = 'valid title';
    const price = 15;

    const cookie = signin();

    const createTicketResponse = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({ title, price })
        .expect(201);

    const ticketId = createTicketResponse.body.id;
    const getTicketResponse = await request(app)
        .get(`/api/tickets/${ticketId}`)
        .set('Cookie', cookie)
        .send()
        .expect(200);
    
    expect(getTicketResponse.body.title).toEqual(title);
    expect(getTicketResponse.body.price).toEqual(price);
});
