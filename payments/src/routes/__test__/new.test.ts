import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { Payment } from '../../models/payment';
import { OrderStatus } from '@azahrandani/common';
import { stripe } from '../../stripe';

// if we test with mocked stripe object
// jest.mock('../../stripe');

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

it('returns a 201 with valid inputs', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const price = Math.floor(Math.random() * 100000);

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId,
        version: 0,
        price,
        status: OrderStatus.Created,
    });
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', signin(userId))
        .send({
            token: 'tok_visa',
            orderId: order.id,
        })
        .expect(201);
    
    // if we test with mocked stripe object
    // const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
    // expect(chargeOptions.source).toEqual('tok_visa');
    // expect(chargeOptions.amount).toEqual(order.price * 100);
    // expect(chargeOptions.currency).toEqual('sgd');
    
    // get the list of 10 most recent charges from stripe
    const stripeCharges = await stripe.charges.list({ limit: 50 });
    const expectedCharge = stripeCharges.data.find((charge) => {
        return charge.amount === price * 100;
    });

    expect(expectedCharge).toBeDefined;
    expect(expectedCharge!.amount).toEqual(price * 100);

    const payment = await Payment.findOne({
        orderId: order.id,
        stripeId: expectedCharge!.id,
    });
    expect(payment).not.toBeNull();
});
