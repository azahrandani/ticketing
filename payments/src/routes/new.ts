import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Order } from '../models/order';
import { Payment } from '../models/payment';
import { stripe } from '../stripe';

import { BadRequestError, NotAuthorizedError, NotFoundError, OrderStatus, requireAuth, validateRequest } from '@azahrandani/common';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

const validation = [
    body('token')
        .notEmpty()
        .withMessage('Token must be supplied bro'),
    body('orderId')
        .notEmpty()
        .withMessage('Order ID must be supplied bro')
];

router.post(
    '/api/payments',
    requireAuth,
    validation,
    validateRequest,
    async (req: Request, res: Response) => {
        const { token, orderId } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            throw new NotFoundError();
        }

        if (order.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError();
        }

        if (order.status === OrderStatus.Cancelled) {
            throw new BadRequestError('The order is already cancelled.');
        }

        const charge = await stripe.charges.create({
            currency: 'sgd',
            amount: order.price * 100,
            source: token,
        });
        const payment = Payment.build({
            orderId,
            stripeId: charge.id
        });
        await payment.save();

        new PaymentCreatedPublisher(natsWrapper.client).publish({
            id: payment.id,
            orderId: order.id,
            stripeId: payment.stripeId,
        });

        res.status(201).send({ id: payment.id });
    }
);

export { router as createChargeRouter };
