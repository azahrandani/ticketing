import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { OrderCancelledEvent, OrderStatus } from "@azahrandani/common";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from '../../../models/ticket';

const setup = async () => {
    // create instance of listener
    const listener = new OrderCancelledListener(natsWrapper.client);

    // create and save a ticket
    const userId = new mongoose.Types.ObjectId().toHexString();
    const orderId = new mongoose.Types.ObjectId().toHexString();
    const ticket = Ticket.build({
        title: 'fansigning event',
        price: 20,
        userId,
    });
    ticket.set({ orderId });
    await ticket.save();

    // create fake data event
    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 0,
        ticket: {
            id: ticket.id,
        }
    };

    // create fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, ticket, data, msg };
};

it('removes order id from the ticket', async () => {
    const { listener, ticket, data, msg } = await setup();

    // call onMessage function with the data + message object
    await listener.onMessage(data, msg);

    // write assertions to make sure the ticket was created
    const updatedTicket = await Ticket.findById(ticket.id);
    
    expect(updatedTicket).toBeDefined();
    expect(updatedTicket!.orderId).not.toBeDefined();
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();

    // call onMessage function with the data + message object
    await listener.onMessage(data, msg);

    // write assertions to make sure ack function is called
    expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event', async () => {
    const { listener, data, msg } = await setup();
    
    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});
