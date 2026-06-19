import {render, screen, waitFor, http,
  HttpResponse, server, URL, userEvent} from './testHelpers';
import {it, expect, beforeEach} from 'vitest';
import {fireEvent} from '@testing-library/react';
import {LayoutContext} from '../App';
import {MemoryRouter, Routes, Route} from 'react-router-dom';
import {mockContext, mockNavigate} from './testHelpers';
import Create from '../view/Create';

const createWrapper = (mobile = false) => (
  <MemoryRouter>
    <LayoutContext.Provider value={{...mockContext, isMobile: mobile}}>
      <Routes>
        <Route path="*" element={<Create drawerWidth={240} />} />
      </Routes>
    </LayoutContext.Provider>
  </MemoryRouter>
);

const submitPost = async (selectGroup = false) => {
  let body;
  server.use(
      http.post(`${URL}/post`, async ({request}) => {
        body = await request.json();
        return HttpResponse.json({postID: '1'}, {status: 201});
      }),
  );

  render(createWrapper());
  await userEvent.type(screen.getByLabelText(
      'contentField').querySelector('input'), 'Hello World');

  if (selectGroup) {
    fireEvent.mouseDown(screen.getByRole('combobox'));
    await userEvent.click(screen.getByText('Guitars'));
  }

  await userEvent.click(screen.getByRole('button', {name: /create post/i}));
  return body;
};

beforeEach(() => {
  server.use(
      http.post(`${URL}/post`,
          () => HttpResponse.json({postID: '1'}, {status: 201})),
  );
});

it('renders content field', () => {
  render(createWrapper());
  expect(screen.getByLabelText('contentField')).toBeInTheDocument();
});

it('types content into field', async () => {
  render(createWrapper());
  const field = screen.getByLabelText('contentField').querySelector('input');
  await userEvent.type(field, 'Hello World');
  expect(field).toHaveValue('Hello World');
});

it('public switch defaults to false', () => {
  render(createWrapper());
  expect(screen.getByRole('checkbox', {name: 'controlled'})).not.toBeChecked();
});

it('toggles public switch', async () => {
  render(createWrapper());
  const toggle = screen.getByRole('checkbox', {name: 'controlled'});
  await userEvent.click(toggle);
  expect(toggle).toBeChecked();
});

it('renders group dropdown with groups from context', () => {
  render(createWrapper());
  fireEvent.mouseDown(screen.getByRole('combobox'));
  expect(screen.getByText('Guitars')).toBeInTheDocument();
});

it('selects a group from dropdown', async () => {
  render(createWrapper());
  fireEvent.mouseDown(screen.getByRole('combobox'));
  await userEvent.click(screen.getByText('Guitars'));
  expect(screen.getByRole('combobox')).toHaveTextContent('Guitars');
});

it('submits post with no group and navigates home', async () => {
  const body = await submitPost();
  await waitFor(() => {
    expect(body.groupID).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/home');
  });
});

it('submits post with a group selected', async () => {
  const body = await submitPost(true);
  await waitFor(() => {
    expect(body.groupID).toBe('1');
  });
});

it('renders full width on mobile', () => {
  render(createWrapper(true));
  expect(screen.getByRole('textbox', {name: 'Content'})).toBeInTheDocument();
});
