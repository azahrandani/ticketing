import { Listener, NotFoundError, OrderCancelledEvent, OrderStatus, Subjects } from '@azahrandani/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';
import { queueGroupName } from './queue-group-name';

class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
    queueGroupName = queueGroupName;
    
    async onMessage(data: OrderCancelledEvent['data'] , msg: Message) {
        const order = await Order.findOne({
            _id: data.id,
            version: data.version - 1
        });
        if (!order) {
            throw new NotFoundError();
        }

        order.set({ status: OrderStatus.Cancelled });
        await order.save();

        msg.ack();
    }
}

export { OrderCancelledListener };
