import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';

import { errorHandler, NotFoundError, currentUser } from '@azahrandani/common';

import { createTicketRouter } from './routes/new';
import { showTicketRouter } from './routes/show';
import { showAllTicketsRouter } from './routes/index';
import { updateTicketRouter } from './routes/update';

const app = express();

// make express aware that it is behind an nginx proxy
// so that it still trusts the traffic as being secure
app.set('trust proxy', true);

app.use(json());
app.use(
    cookieSession({
        signed: false, // disable encryption
        secure: process.env.NODE_ENV !== 'test', // cookie is only used on HTTPS connection
    })
);
app.use(currentUser);

app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(showAllTicketsRouter);
app.use(updateTicketRouter);

app.get('*', async (req, res) => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };
