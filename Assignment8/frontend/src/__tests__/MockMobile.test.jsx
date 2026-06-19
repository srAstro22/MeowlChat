import {render, screen, http,
  HttpResponse, server, URL, userEvent} from './testHelpers';
import {it, expect, vi, beforeEach} from 'vitest';
import {fireEvent} from '@testing-library/react';
import {LayoutContext} from '../App';
import {MemoryRouter, Routes, Route} from 'react-router-dom';
import {mockContext} from './testHelpers';
import {useState} from 'react';
import Home from '../view/Home';

vi.mock('@mui/material/useMediaQuery', () => ({
  default: () => true,
}));

const MobileWrapper = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <MemoryRouter>
      <LayoutContext.Provider value={{...mockContext, isMobile: true,
        drawerOpen, setDrawerOpen}}>
        <Routes>
          <Route path="/" element={<Home drawerWidth={240} />} />
        </Routes>
      </LayoutContext.Provider>
    </MemoryRouter>
  );
};

const openDrawer = async () => {
  render(<MobileWrapper />);
  await userEvent.click(screen.getByLabelText('show groups'));
};

beforeEach(() => {
  server.use(
      http.get(`${URL}/post`, () => HttpResponse.json([])),
  );
});

it('renders Home page', () => {
  render(<MobileWrapper />);
  expect(screen.getByText(/MeowlChat/i)).toBeInTheDocument();
});

it('drawer initially closed on mobile', () => {
  render(<MobileWrapper />);
  expect(screen.getByLabelText('show groups')).toBeInTheDocument();
});

it('opens drawer on button click', async () => {
  await openDrawer();
  expect(screen.getByLabelText('hide groups')).toBeInTheDocument();
});

it('closes drawer on button click', async () => {
  await openDrawer();
  await userEvent.click(screen.getByLabelText('hide groups'));
  expect(screen.getByLabelText('show groups')).toBeInTheDocument();
});

it('closes drawer when My Posts clicked', async () => {
  await openDrawer();
  await userEvent.click(screen.getByLabelText('my-posts'));
  expect(screen.getByLabelText('show groups')).toBeInTheDocument();
});

it('closes drawer when Create Post clicked', async () => {
  await openDrawer();
  await userEvent.click(screen.getByLabelText('create-post'));
  expect(screen.getByLabelText('show groups')).toBeInTheDocument();
});

it('closes drawer on backdrop click', async () => {
  await openDrawer();
  fireEvent.click(document.querySelector('.MuiBackdrop-root'));
  expect(screen.getByLabelText('show groups')).toBeInTheDocument();
});

it('uses temporary drawer on mobile', async () => {
  await openDrawer();
  expect(document.querySelector('.MuiDrawer-modal')).not.toBeNull();
});

it('logout button is present', async () => {
  render(<MobileWrapper />);
  await userEvent.click(screen.getByLabelText('logout'));
  expect(screen.getByText(/MeowlChat/i)).toBeInTheDocument();
});

it('renders Posts on home route', () => {
  render(<MobileWrapper />);
  expect(screen.getByLabelText('posts')).toBeInTheDocument();
});

it('renders Create on createPost route', () => {
  render(
      <MemoryRouter initialEntries={['/createPost']}>
        <LayoutContext.Provider value={{...mockContext, isMobile: true,
          drawerOpen: false, setDrawerOpen: vi.fn()}}>
          <Routes>
            <Route path="/createPost" element={<Home drawerWidth={240} />} />
          </Routes>
        </LayoutContext.Provider>
      </MemoryRouter>,
  );
  expect(screen.getByLabelText('contentField')).toBeInTheDocument();
});
