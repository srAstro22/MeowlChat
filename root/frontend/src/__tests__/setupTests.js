import {setupServer} from 'msw/node';
import {beforeAll, afterAll, afterEach} from 'vitest';
import {cleanup} from '@testing-library/react';

export const URL = 'http://localhost:3010/api/v0';
export const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  cleanup();
}); afterAll(() => server.close());
