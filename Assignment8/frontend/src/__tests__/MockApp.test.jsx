import {render, waitFor, http,
  HttpResponse, server, URL} from './testHelpers';
import {it, expect, beforeEach} from 'vitest';
import App from '../App';

beforeEach(() => {
  localStorage.removeItem('accessToken');
});

it('fetches groups when token exists', async () => {
  let fetched = false;
  server.use(
      http.get(`${URL}/group`, () => {
        fetched = true;
        return HttpResponse.json([{groupid: '1', groupname: 'Guitars'}]);
      }),
  );

  localStorage.setItem('accessToken', 'fake-token');
  render(<App />);

  await waitFor(() => {
    expect(fetched).toBe(true);
  });
});

it('does not fetch groups without token', async () => {
  let fetched = false;
  server.use(
      http.get(`${URL}/group`, () => {
        fetched = true;
        return HttpResponse.json([]);
      }),
  );

  render(<App />);

  await waitFor(() => {
    expect(fetched).toBe(false);
  });
});

it('handles failed group fetch', async () => {
  let fetched = false;

  server.use(
      http.get(`${URL}/group`, () => {
        fetched = true;
        return new HttpResponse(null, {status: 401});
      }),
  );

  localStorage.setItem('accessToken', 'fake-token');
  render(<App />);

  await waitFor(() => expect(fetched).toBe(true));
});
