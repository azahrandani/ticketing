import { Publisher, ExpirationCompleteEvent, Subjects } from "@azahrandani/common";

class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
}

export { ExpirationCompletePublisher };
