import { Publisher, PaymentCreatedEvent, Subjects } from "@azahrandani/common";

class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
}

export { PaymentCreatedPublisher };
