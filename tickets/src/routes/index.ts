import express, { Request, Response } from 'express';
import { Ticket } from '../models/ticket';

import { NotFoundError } from '@azahrandani/common';

const router = express.Router();

router.get(
    '/api/tickets/',
    async (req: Request, res: Response) => {
        const tickets = await Ticket.find();
        if (!tickets) {
            throw new NotFoundError();
        }

        res.status(200).send(tickets);
    }
);

export { router as showAllTicketsRouter };
