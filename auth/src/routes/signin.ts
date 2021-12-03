import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

import { BadRequestError, validateRequest } from '@azahrandani/common';

import { User } from '../models/user';
import { Password } from '../services/password';

const router = express.Router();

const validation = [
    body('email')
        .isEmail()
        .withMessage('Email must be valid in sign in bro'),
    body('password')
        .trim()
        .notEmpty()
        .withMessage('Password must be supplied bro')
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
    '/api/users/signin',
    validation,
    validateRequest,
    async (req: Request, res: Response) => {
        const { email, password } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            throw new BadRequestError('Sorry, but failed login 1! (( Swipe swipe.. ))');
        }

        const passwordsMatch = await Password.compare(existingUser.password, password);
        if (!passwordsMatch) {
            throw new BadRequestError('Sorry, but failed login 2! (( Swipe swipe.. ))');
        }

        const userJwt = generateUserJwt(existingUser);
        // store JWT on session object
        req.session = {
            jwt: userJwt
        };

        res.status(200).send(existingUser);
    }
);

export { router as signInRouter };
