import supertest from 'supertest';
import * as db from './db.js';
import server from '../src/app.js';

export const ctx = {request: null, token: null};

/**
 *
 */
export async function setup() {
  server.listen();
  ctx.request = supertest(server);
  await db.reset();
}

/**
 *
 */
export async function teardown() {
  await db.close();
  await server.close();
}

/**
 *
 * @param {string} email -
 * @param {string} password -
 * @returns {string} -
 */
export async function login(email, password) {
  const res = await ctx.request
      .post('/api/v0/login')
      .send({email, password});
  ctx.token = res.body.accessToken;
  return res.body;
}
