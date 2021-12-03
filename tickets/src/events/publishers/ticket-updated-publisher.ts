import { Publisher, Subjects, TicketUpdatedEvent } from '@azahrandani/common';

class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
}

export { TicketUpdatedPublisher };
