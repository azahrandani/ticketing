import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';

import { errorHandler, NotFoundError, currentUser } from '@azahrandani/common';

import { createChargeRouter } from './routes/new';

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

app.use(createChargeRouter);

app.get('*', async (req, res) => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };
