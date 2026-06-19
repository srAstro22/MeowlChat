import {render, screen, userEvent} from './testHelpers';
import {it, expect} from 'vitest';
import SideBar from '../view/Drawer';
import {LayoutContext} from '../App';
import {MemoryRouter, Routes, Route} from 'react-router-dom';
import {mockNavigate, mockContext} from './testHelpers';

const sideBarWrapper = (initialPath = '/home') => (
  <MemoryRouter initialEntries={[initialPath]}>
    <Routes>
      <Route path="/home" element={
        <LayoutContext.Provider value={mockContext}>
          <SideBar drawerWidth={240} />
        </LayoutContext.Provider>
      }/>
      <Route path="/group/:groupID" element={
        <LayoutContext.Provider value={mockContext}>
          <SideBar drawerWidth={240} />
        </LayoutContext.Provider>
      }/>
    </Routes>
  </MemoryRouter>
);

it('renders group names in sidebar', () => {
  render(sideBarWrapper());
  expect(screen.getByText('Guitars')).toBeInTheDocument();
});

it('renders nothing when no groups in context', () => {
  render(sideBarWrapper());
  expect(screen.queryByRole('button',
      {name: /unknown/i})).not.toBeInTheDocument();
});

it('navigates to group on click', async () => {
  render(sideBarWrapper());
  const user = userEvent.setup();
  await user.click(screen.getByText('Guitars'));
  expect(mockNavigate).toHaveBeenCalledWith('/group/1');
});

it('shows checkbox for current group', () => {
  render(sideBarWrapper('/group/1'));
  expect(screen.getByLabelText('checked')).toBeInTheDocument();
});

it('shows checkbox when on my posts route', () => {
  render(
      <MemoryRouter initialEntries={['/post/mine']}>
        <Routes>
          <Route path="/post/mine" element={
            <LayoutContext.Provider value={mockContext}>
              <SideBar drawerWidth={240} />
            </LayoutContext.Provider>
          }/>
        </Routes>
      </MemoryRouter>,
  );

  expect(screen.getByLabelText('my-posts').querySelector(
      '[aria-label="checked"]')).toBeInTheDocument();
});
