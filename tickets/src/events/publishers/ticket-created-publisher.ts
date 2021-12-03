import { Publisher, Subjects, TicketCreatedEvent } from '@azahrandani/common';

class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
}

export { TicketCreatedPublisher };
