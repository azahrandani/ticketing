import { Message } from "node-nats-streaming";
import { Listener, Subjects, PaymentCreatedEvent, OrderStatus, NotFoundError } from "@azahrandani/common";
import { queueGroupName } from './queue-group-name';
import { Order } from '../../models/order';
import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher";

class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
        const { orderId } = data;

        const order = await Order.findById(orderId);
        if (!order) {
            throw new NotFoundError();
        }

        order.set({ status: OrderStatus.Complete });
        await order.save();

        msg.ack();
    }
}

export { PaymentCreatedListener };
