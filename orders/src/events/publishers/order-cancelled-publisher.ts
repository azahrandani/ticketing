import { Publisher, OrderCancelledEvent, Subjects } from "@azahrandani/common";

class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
}

export { OrderCancelledPublisher };
