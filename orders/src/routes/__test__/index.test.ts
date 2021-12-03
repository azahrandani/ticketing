import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

const createTicket = async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'BTS concert',
        price: 15000
    });
    await ticket.save();
    return ticket;
};

it('successfully fetches orders for a particular user', async () => {
    const firstTicket = await createTicket();
    const secondTicket = await createTicket();
    const thirdTicket = await createTicket();

    const firstUser = signin();
    const secondUser = signin();

    // first user order
    await request(app)
        .post('/api/orders')
        .set('Cookie', firstUser)
        .send({ ticketId: firstTicket.id })
        .expect(201);

    // second user orders
    const { body: firstExpectedOrder } = await request(app)
        .post('/api/orders')
        .set('Cookie', secondUser)
        .send({ ticketId: secondTicket.id })
        .expect(201);
    const { body: secondExpectedOrder } = await request(app)
        .post('/api/orders')
        .set('Cookie', secondUser)
        .send({ ticketId: thirdTicket.id })
        .expect(201);
    
    const secondUserOrders = await request(app)
        .get('/api/orders')
        .set('Cookie', secondUser)
        .expect(200);
    
    expect(secondUserOrders.body.length).toEqual(2);
    expect(secondUserOrders.body[0].id).toEqual(firstExpectedOrder.id);
    expect(secondUserOrders.body[0].ticket.id).toEqual(secondTicket.id);
    expect(secondUserOrders.body[1].id).toEqual(secondExpectedOrder.id);
    expect(secondUserOrders.body[1].ticket.id).toEqual(thirdTicket.id);
});