import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

// Typescript interface which are required
// to create a new ticket
interface TicketAttrs {
    title: string;
    price: number;
    userId: string;
}

// Typescript interface which are required
// to create a Ticket Model
interface TicketModel extends mongoose.Model<TicketDocument> {
    build(attrs: TicketAttrs): TicketDocument;
}

// Typescript interface which are required
// to create a Ticket Document
interface TicketDocument extends mongoose.Document {
    title: string;
    price: number;
    userId: string;
    version: number;
}

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    userId: {
        type: String,
        required: true
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
});

ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.build = (attrs: TicketAttrs) => {
    return new Ticket(attrs);
}

const Ticket = mongoose.model<TicketDocument, TicketModel>('User', ticketSchema);

export { Ticket };
