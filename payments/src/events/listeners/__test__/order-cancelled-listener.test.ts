import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { OrderCancelledEvent, OrderStatus } from "@azahrandani/common";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Order } from '../../../models/order';

const setup = async () => {
    // create instance of listener
    const listener = new OrderCancelledListener(natsWrapper.client);

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        version: 0,
        userId: new mongoose.Types.ObjectId().toHexString(),
        price: 20
    });
    await order.save();

    // create fake data event
    const data: OrderCancelledEvent['data'] = {
        id: order.id,
        version: 1,
        ticket: {
            id: new mongoose.Types.ObjectId().toHexString(),
        }
    };

    // create fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, order, data, msg };
};

it('updates the status of order to cancelled', async () => {
    const { listener, order, data, msg } = await setup();

    // call onMessage function with the data + message object
    await listener.onMessage(data, msg);

    // write assertions to make sure the ticket was created
    const updatedOrder = await Order.findById(order.id);
    
    expect(updatedOrder).toBeDefined();
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();

    // call onMessage function with the data + message object
    await listener.onMessage(data, msg);

    // write assertions to make sure ack function is called
    expect(msg.ack).toHaveBeenCalled();
});
