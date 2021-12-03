import { Publisher, OrderCreatedEvent, Subjects } from "@azahrandani/common";

class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
}

export { OrderCreatedPublisher };
