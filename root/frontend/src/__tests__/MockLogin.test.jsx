import {render, screen, waitFor, http,
  HttpResponse,
  server, URL, userEvent} from './testHelpers';
import Login from '../view/Login';
import {MemoryRouter} from 'react-router-dom';
import {it, expect, vi} from 'vitest';
import {LayoutContext} from '../App';
import {mockContext} from './testHelpers';

// Claude Assisted with Writing mockStorage
// For consistent JWT throughout tests
const mockStorage = {};
vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
  mockStorage[key] = value;
});
vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
  return mockStorage[key] ?? null;
});

const loginWrapper = () => (
  <MemoryRouter>
    <LayoutContext.Provider value={mockContext}>
      <Login />
    </LayoutContext.Provider>
  </MemoryRouter>
);

it('successful login', async () => {
  const user = userEvent.setup();

  server.use(
      http.post(`${URL}/login`, () => {
        return HttpResponse.json({accessToken: 'fake-token'});
      }),
  );

  render(loginWrapper());

  await user.type(screen.getByLabelText(/email-box/i), 'ayeastro@gmail.com');
  await user.type(screen.getByLabelText(/password-box/i), 'likeaboss');
  await user.click(screen.getByRole('button', {name: /login/i}));

  await waitFor(() => {
    expect(mockStorage['accessToken']).toBe('fake-token');
  });
});

it('failed login', async () => {
  const user = userEvent.setup();

  server.use(
      http.post(`${URL}/login`, () => {
        return HttpResponse.json({error: 'Invalid Credentials'}, {status: 401});
      }),
  );

  render(loginWrapper());

  await user.type(screen.getByLabelText(/email-box/i), 'wrong@email.com');
  await user.type(screen.getByLabelText(/password-box/i), 'wrongpassword');
  await user.click(screen.getByRole('button', {name: /login/i}));

  await waitFor(() => {
    expect(screen.getByText(/Invalid Credentials/i)).toBeInTheDocument();
  });
});
