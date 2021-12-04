import { Message } from "node-nats-streaming";
import { Listener, NotFoundError, Subjects, TicketUpdatedEvent } from "@azahrandani/common";
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../models/ticket';

class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
    queueGroupName = queueGroupName;

    async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
        const { title, price } = data;
        
        const ticket = await Ticket.findByEvent(data);
        if (!ticket) {
            throw new NotFoundError();
        }
        
        ticket.set({ title, price });
        await ticket.save();

        msg.ack();
    }
}

export { TicketUpdatedListener };
