import request from 'supertest';
import { app } from '../../app';

it('returns a list of tickets', async () => {
    const payloads = [
        { title: 'ticket number one', price: 10 },
        { title: 'ticket number two', price: 15 },
        { title: 'ticket number three', price: 20 },
    ];

    const cookie = signin();
    for (let payload of payloads) {
        await request(app)
            .post('/api/tickets')
            .set('Cookie', cookie)
            .send(payload)
            .expect(201);
    }

    const response = await request(app)
            .get('/api/tickets')
            .send()
            .expect(200);
    const tickets = response.body;

    expect(tickets.length).toEqual(3);
    for (let i = 0; i < tickets.length; i++) {
        expect(tickets[i].title).toEqual(payloads[i].title);
        expect(tickets[i].price).toEqual(payloads[i].price);
    }
});