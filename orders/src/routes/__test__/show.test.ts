import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

it('successfully fetches the order', async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'zahra fan signing',
        price: 15000
    });
    await ticket.save();

    const user = signin();

    const { body: createdOrder } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket.id })
        .expect(201);
    
    const { body: fetchedOrder } = await request(app)
        .get(`/api/orders/${createdOrder.id}`)
        .set('Cookie', user)
        .send()
        .expect(200);
    
    expect(fetchedOrder.id).toEqual(createdOrder.id);
});

it('returns an error if a user requests another user\'s order', async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'zahra fan signing',
        price: 15000
    });
    await ticket.save();

    const firstUser = signin();
    const { body: createdOrder } = await request(app)
        .post('/api/orders')
        .set('Cookie', firstUser)
        .send({ ticketId: ticket.id })
        .expect(201);
    
    const secondUser = signin();
    const { body: fetchedOrder } = await request(app)
        .get(`/api/orders/${createdOrder.id}`)
        .set('Cookie', secondUser)
        .send()
        .expect(401);
});
