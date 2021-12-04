import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { OrderStatus } from '@azahrandani/common';

export { OrderStatus };

interface OrderAttrs {
    id: string;
    status: OrderStatus;
    version: number;
    userId: string;
    price: number;
}

interface OrderModel extends mongoose.Model<OrderDocument> {
    build(attrs: OrderAttrs): OrderDocument;
}

interface OrderDocument extends mongoose.Document {
    status: OrderStatus;
    version: number;
    userId: string;
    price: number;
}

const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: Object.values(OrderStatus),
    },
    price: {
        type: Number,
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

orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs: OrderAttrs) => {
    return new Order({
        _id: attrs.id,
        status: attrs.status,
        version: attrs.version,
        userId: attrs.userId,
        price: attrs.price
    });
}

const Order = mongoose.model<OrderDocument, OrderModel>('Order', orderSchema);

export { Order };
