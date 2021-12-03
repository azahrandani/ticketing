import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('returns an error if the ticket does not exist', async () => {
    const ticketId = new mongoose.Types.ObjectId().toHexString();

    await request(app)
        .post('/api/orders')
        .set('Cookie', signin())
        .send({ ticketId })
        .expect(404);
});

it('returns an error if the ticket is already reserved', async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'big bad wolf',
        price: 50000
    });
    await ticket.save();

    const order = Order.build({
        ticket,
        userId: 'randomUserId',
        status: OrderStatus.Created,
        expiresAt: new Date()
    });
    await order.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', signin())
        .send({ ticketId: ticket.id })
        .expect(400);
});

it('successfully reserves a ticket', async () => {
    let orders = await Order.find();
    expect(orders.length).toEqual(0);

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'big bad wolf',
        price: 50000
    });
    await ticket.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', signin())
        .send({ ticketId: ticket.id })
        .expect(201);
    
    orders = await Order.find();
    expect(orders.length).toEqual(1);
});

it('successfully publishes an event', async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'big bad wolf',
        price: 50000
    });
    await ticket.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', signin())
        .send({ ticketId: ticket.id })
        .expect(201);
    
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});
