import { Listener, NotFoundError, OrderCreatedEvent, OrderStatus, Subjects } from '@azahrandani/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queueGroupName = queueGroupName;
    
    async onMessage(data: OrderCreatedEvent['data'] , msg: Message) {
        const ticket = await Ticket.findById(data.ticket.id);
        if (!ticket) {
            throw new NotFoundError();
        }

        ticket.set({orderId: data.id});
        await ticket.save();

        msg.ack();
    }
}

export { OrderCreatedListener };
