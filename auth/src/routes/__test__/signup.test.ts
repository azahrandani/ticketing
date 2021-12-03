import request from 'supertest';
import { app } from '../../app';

it('returns a 201 on successful signup', async () => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: 'azahra9@random.com',
            password: 'letsgo'
        })
        .expect(201);
});

it('returns a 400 with an invalid email', async () => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: 'invalid-email.com',
            password: 'letsgo'
        })
        .expect(400);
});

it('returns a 400 with an invalid password', async () => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: 'azahra9@random.com',
            password: 'no'
        })
        .expect(400);
});

it('returns a 400 with missing email and password', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'azahra9@random.com'
        })
        .expect(400);

    await request(app)
        .post('/api/users/signup')
        .send({
            password: 'letsgo'
        })
        .expect(400);
});

it('disallows duplicate email', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'azahra@random.com',
            password: 'letsgo'
        })
        .expect(201);

    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'azahra@random.com',
            password: 'letsgo??'
        })
        .expect(400);
});

it('sets a cookie after successful signup', async () => {
    const response = await request(app)
        .post('/api/users/signup')
        .send({
            email: 'azahra@random.com',
            password: 'letsgo'
        })
        .expect(201);
    
    expect(response.get('Set-Cookie')).toBeDefined();
});
