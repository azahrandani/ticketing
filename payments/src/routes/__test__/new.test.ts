import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';
import { OrderStatus } from '@azahrandani/common';

it('returns a 404 when purchasing a non-existent order', async () => {
    const response = await request(app)
        .post('/api/payments')
        .set('Cookie', signin())
        .send({
            token: new mongoose.Types.ObjectId().toHexString(),
            orderId: new mongoose.Types.ObjectId().toHexString(),
        });
    expect(response.statusCode).toEqual(404);
});

it('returns a 401 when purchasing an order that does not belong to the user', async () => {
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        price: 25,
        status: OrderStatus.Created,
    });
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', signin())
        .send({
            token: new mongoose.Types.ObjectId().toHexString(),
            orderId: order.id,
        })
        .expect(401);
});

it('returns a 400 when purchasing a cancelled order', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId,
        version: 0,
        price: 25,
        status: OrderStatus.Cancelled,
    });
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', signin(userId))
        .send({
            token: new mongoose.Types.ObjectId().toHexString(),
            orderId: order.id,
        })
        .expect(400);
});
