import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

declare global {
    var signin: (id?: string) => string[];
}

jest.mock('../nats-wrapper');

// to accommodate actually calling the stripe api
process.env.STRIPE_KEY = 'sk_test_51K317dFWfZOD1YVn3mLfjxqzSnEyN39QKoGPebWf5qkbDWeTckO3VpO6k2q0Qe6FSJ55iuvyxyqHZNspH9PdbfQK00nJjREMUu';

let mongo: any;
beforeAll(async () => {
    process.env.JWT_KEY = 'someSecretPrivateKey';

    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();
    
    await mongoose.connect(mongoUri);
});

beforeEach(async () => {
    jest.clearAllMocks();
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    await mongoose.connection.close();
    await mongo.stop();
});

global.signin = (id?: string) => {
    // Fabricate a fake cookie
    const payload = {
        id: id || new mongoose.Types.ObjectId().toHexString(),
        email: 'azahra@random.com'
    };
    const userJwt = jwt.sign(payload, process.env.JWT_KEY!);
    const session = { jwt: userJwt }
    const sessionJSON = JSON.stringify(session);
    const base64 = Buffer.from(sessionJSON).toString('base64');
    const cookie = [`express:sess=${base64}`];
    return cookie;
};
