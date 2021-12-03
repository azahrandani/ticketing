import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';

import { requireAuth, validateRequest, NotAuthorizedError, NotFoundError } from '@azahrandani/common';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

const validation = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Title must be valid bro'),
    body('price')
        .isFloat({gt: 0})
        .withMessage('Price must be valid bro, must be greater than 0')
];

router.put(
    '/api/tickets/:id',
    requireAuth,
    validation,
    validateRequest,
    async (req: Request, res: Response) => {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) {
            throw new NotFoundError();
        }

        if (ticket.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError();
        }

        ticket.set({
            title: req.body.title,
            price: req.body.price
        });
        await ticket.save();

        new TicketUpdatedPublisher(natsWrapper.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version
        });

        res.send(ticket);
    }
);

export { router as updateTicketRouter };
