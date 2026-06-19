import {it, beforeAll, beforeEach,
  afterAll, expect, describe} from 'vitest';
import {ctx, setup, teardown} from './setup.js';

beforeAll(setup);
afterAll(teardown);

let request;
beforeEach(() => {
  request = ctx.request;
});

it('Errors on GET Invalid URL', async () => {
  await request.get('/api/v0/so-not-a-real-end-point')
      .expect(404);
});

/*
#####################
#       Login       #
#####################
*/
describe('Login API', () => {
  it('401 Invalid Credentials', async () => {
    await request.post('/api/v0/login')
        .send({
          email: 'ayeaso@gmail.com',
          password: 'wrongpassword',
        })
        .expect(401);
  });

  it('401 Invalid Password', async () => {
    await request.post('/api/v0/login')
        .send({
          email: 'ayeastro@gmail.com',
          password: 'wrongpassword',
        })
        .expect(401);
  });

  it('400 No User', async () => {
    await request.post('/api/v0/login')
        .send({})
        .expect(400);
  });

  let res;
  beforeAll(async () => {
    res = await request.post('/api/v0/login')
        .send({
          email: 'ayeastro@gmail.com',
          password: 'likeaboss',
        });
  });

  it('200 Successful', async () => {
    expect(res.status).toBe(200);
  });

  it('Have Property User', async () => {
    expect(res.body).toHaveProperty('user');
  });

  it('Have Property ID', async () => {
    expect(res.body.user).toHaveProperty('id');
  });

  it('Have Property Name', async () => {
    expect(res.body.user).toHaveProperty('name');
  });
  it('Have Property Email', async () => {
    expect(res.body.user).toHaveProperty('email');
  });
  it('Have JWT', async () => {
    expect(res.body).toHaveProperty('accessToken');
  });
});
