import {render, screen} from './testHelpers';
import Header from '../view/Header';
import {it, expect} from 'vitest';
import {MemoryRouter, Routes, Route} from 'react-router-dom';
import {LayoutContext} from '../App';
import {mockNavigate, mockContext} from './testHelpers';
import userEvent from '@testing-library/user-event';

const headerWrapper = (path = '/home') => (
  <MemoryRouter initialEntries={[path]}>
    <LayoutContext.Provider value={mockContext}>
      <Routes>
        <Route path="*" element={<Header />} />
      </Routes>
    </LayoutContext.Provider>
  </MemoryRouter>
);

it('navigates home on avatar click', async () => {
  render(headerWrapper());

  const user = userEvent.setup();
  await user.click(screen.getByLabelText('go-home'));

  expect(mockNavigate).toHaveBeenCalledWith('/home');
});

it('shows My Posts title', () => {
  render(headerWrapper('/post/mine'));
  expect(screen.getByText('My Posts')).toBeInTheDocument();
});

it('shows Create Post title', () => {
  render(headerWrapper('/createPost'));
  expect(screen.getByText('Create Post')).toBeInTheDocument();
});

it('shows Group Posts title', () => {
  render(headerWrapper('/group/1'));
  expect(screen.getByText('Group Posts')).toBeInTheDocument();
});
