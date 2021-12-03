import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';


import { User } from '../models/user';
import { BadRequestError, validateRequest } from '@azahrandani/common';
// import { DatabaseConnectionError } from '../errors/database-connection-error';

const router = express.Router();

const validation = [
    body('email')
        .isEmail()
        .withMessage('Email must be valid bro'),
    body('password')
        .trim()
        .isLength({min: 4, max: 20})
        .withMessage('Password must be between 4 and 20 chars length bro')
];

const generateUserJwt = (user: any) => {
    const userJwt = jwt.sign(
        {
            id: user.id,
            email: user.email
        },
        process.env.JWT_KEY!
    )
    return userJwt;
};

router.post(
    '/api/users/signup',
    validation,
    validateRequest,
    async (req: Request, res: Response) => {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('Oops.. email is in use.');
            throw new BadRequestError('The email is already taken bro');
        }
        const user = User.build({email, password});
        await user.save();

        const userJwt = generateUserJwt(user);
        // store JWT on session object
        req.session = {
            jwt: userJwt
        };

        res.status(201).send(user);

        // console.log('Signing up..');
        // throw new DatabaseConnectionError();
        // res.send('Hi there! This is a successful sign up!');
    }
);

export { router as signUpRouter };
