import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher';
import { natsWrapper } from '../nats-wrapper';

import { requireAuth, validateRequest } from '@azahrandani/common';

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

router.post(
    '/api/tickets',
    validation,
    validateRequest,
    requireAuth,
    async (req: Request, res: Response) => {
        const { title, price } = req.body;
        const userId = req.currentUser!.id;

        const ticket = Ticket.build({ title, price, userId });
        await ticket.save();
        

        await new TicketCreatedPublisher(natsWrapper.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version
        });

        res.status(201).send(ticket);
    }
);

export { router as createTicketRouter };
