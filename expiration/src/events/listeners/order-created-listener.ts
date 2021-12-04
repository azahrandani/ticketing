import { Listener, NotFoundError, OrderCreatedEvent, OrderStatus, Subjects } from '@azahrandani/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { expirationQueue } from '../../queues/expiration-queue';

class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queueGroupName = queueGroupName;
    
    async onMessage(data: OrderCreatedEvent['data'] , msg: Message) {
        await expirationQueue.add({
            orderId: data.id
        });
        msg.ack();
    }
}

export { OrderCreatedListener };
