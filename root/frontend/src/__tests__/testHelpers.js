import {vi} from 'vitest';

export {render, screen, waitFor} from '@testing-library/react';
export {http, HttpResponse} from 'msw';
export {server, URL} from './setupTests';
export {default as userEvent} from '@testing-library/user-event';

export const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

export const mockContext = {
  drawerOpen: false,
  setDrawerOpen: vi.fn(),
  drawerWidth: 240,
  isMobile: false,
  groupNames: [
    {groupid: '1', groupname: 'Guitars'},
    {groupid: '2', groupname: 'Movie Names'},
  ],
  setGroupNames: vi.fn(),
  setToken: vi.fn(),
};
