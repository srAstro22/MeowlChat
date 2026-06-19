import {render, screen, waitFor,
  http, HttpResponse,
  server, URL, mockContext, mockNavigate, userEvent} from './testHelpers';
import {it, expect, vi, describe} from 'vitest';
import Posts from '../view/Posts';
import {LayoutContext} from '../App';
import {MemoryRouter, Routes, Route} from 'react-router-dom';

vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('fake-token');

const postsWrapper = (groupID = undefined) => (
  <MemoryRouter>
    <LayoutContext.Provider value={mockContext}>
      <Posts drawerWidth={240} groupID={groupID} />
    </LayoutContext.Provider>
  </MemoryRouter>
);

const mockPosts = [
  {postID: '1',
    username: 'Aye Astro',
    content: 'Hello World',
    date: '2022-01-01T00:00:00.000Z'},
  {postID: '2',
    username: 'Molly Maze',
    content: 'Electric Guitar',
    date: '2022-01-01T00:00:00.000Z'},
];

// Use Known Post Data
const makePost = (date) => ([
  {postID: '1', username: 'Aye Astro', content: 'Test Post', date},
]);

describe('General Post Logic', () => {
  it('does not fetch posts when no token', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValueOnce(null);

    const fetchSpy = vi.spyOn(window, 'fetch');

    render(postsWrapper());

    await waitFor(() => {
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  it('renders all posts when no group selected', async () => {
    server.use(
        http.get(`${URL}/post`, () => {
          return HttpResponse.json(mockPosts);
        }),
    );

    render(postsWrapper());

    await waitFor(() => {
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });
  });

  it('renders group posts when groupID provided', async () => {
    server.use(
        http.get(`${URL}/group/abc-123/post`, () => {
          return HttpResponse.json([{groupID: 'abc-123', posts: mockPosts}]);
        }),
    );

    render(postsWrapper('abc-123'));

    await waitFor(() => {
      expect(screen.getByText('Electric Guitar')).toBeInTheDocument();
    });
  });

  it('renders nothing when fetch fails', async () => {
    server.use(
        http.get(`${URL}/post`, () => {
          return new HttpResponse(null, {status: 401});
        }),
    );

    render(postsWrapper());

    await waitFor(() => {
      expect(screen.queryByText('Hello World')).not.toBeInTheDocument();
    });
  });

  it('navigates home on invalid groupID', async () => {
    server.use(
        http.get(`${URL}/group/bad-id/post`, () => {
          return new HttpResponse(null, {status: 404});
        }),
    );

    render(postsWrapper('bad-id'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
  });

  it('fetches my posts', async () => {
    server.use(
        http.get(`${URL}/post/mine`, () => HttpResponse.json(mockPosts)),
    );

    render(
        <MemoryRouter initialEntries={['/post/mine']}>
          <LayoutContext.Provider value={mockContext}>
            <Routes>
              <Route path="/post/mine"
                element={<Posts drawerWidth={240} />} />
            </Routes>
          </LayoutContext.Provider>
        </MemoryRouter>,
    );

    await waitFor(() => screen.getByText('Hello World'));
  });
});

describe('Test Date Format', () => {
  // Render Date
  const renderWithDate = async (date) => {
    server.use(
        http.get(`${URL}/post`, () =>
          HttpResponse.json(makePost(date)),
        ),
    );
    render(postsWrapper());
    await waitFor(() => screen.getByText('Test Post'));
  };

  // Instead of Hardcoding dates
  // Make it render time the way our Program does
  it('formats today as time', async () => {
    await renderWithDate(new Date().toISOString());
    expect(screen.getByText(/^\d{2}:\d{2}$/)).toBeInTheDocument();
  });

  it('formats yesterday as Yesterday', async () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    await renderWithDate(d.toISOString());
    expect(screen.getByText(/^Yesterday @ \d{2}:\d{2}$/)).toBeInTheDocument();
  });

  it('formats recent date as Mon DD', async () => {
    const d = new Date();
    d.setMonth(d.getMonth() - 2);
    await renderWithDate(d.toISOString());
    expect(screen.getByText(
        /^[A-Z][a-z]{2} \d{2} @ \d{2}:\d{2}$/,
    )).toBeInTheDocument();
  });

  it('formats old date as year', async () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 2);
    await renderWithDate(d.toISOString());
    expect(screen.getByText(String(d.getFullYear()))).toBeInTheDocument();
  });
});

describe('Style + Icons', () => {
  it('renders public icon for public post', async () => {
    server.use(
        http.get(`${URL}/post`, () =>
          HttpResponse.json([{...mockPosts[0], isPublic: true}]),
        ),
    );
    render(postsWrapper());
    await waitFor(() => screen.getByText('Hello World'));
    expect(screen.getByLabelText('publicIcon')).toBeInTheDocument();
  });

  it('renders lock icon for private post', async () => {
    server.use(
        http.get(`${URL}/post`, () =>
          HttpResponse.json([{...mockPosts[0], isPublic: false}]),
        ),
    );
    render(postsWrapper());
    await waitFor(() => screen.getByText('Hello World'));
    expect(screen.getByLabelText('privateIcon')).toBeInTheDocument();
  });
});

describe('Post Like Feature', () => {
  const makePostData = (liked) => ([
    {
      postID: '1',
      username: 'Aye Astro',
      content: 'Hello World',
      date: '2022-01-01T00:00:00.000Z',
      isPublic: true,
      likes: liked ? 1 : 0,
      likedByMe: liked,
    },
    {
      postID: '2',
      username: 'Molly Maze',
      content: 'Other Post',
      date: '2022-01-01T00:00:00.000Z',
      isPublic: true,
      likes: 0,
      likedByMe: false,
    },
  ]);

  const renderPost = async (liked) => {
    server.use(
        http.get(`${URL}/post`, () =>
          HttpResponse.json(makePostData(liked))),
    );
    render(postsWrapper());
    await waitFor(() => screen.getByText('Hello World'));
  };

  it('renders filled heart when likedByMe is true', async () => {
    await renderPost(true);
    expect(screen.getByLabelText('unlike')).toBeInTheDocument();
  });

  it('renders empty heart when likedByMe is false', async () => {
    await renderPost(false);
    expect(screen.getAllByLabelText('like')[0]).toBeInTheDocument();
  });

  it('likes a post', async () => {
    server.use(
        http.get(`${URL}/post`, () => HttpResponse.json(makePostData(false))),
        http.post(`${URL}/post/1/like`, () =>
          HttpResponse.json({
            ...makePostData(false)[0], likes: 1, likedByMe: true})),
    );
    render(postsWrapper());
    const user = userEvent.setup();
    await waitFor(() => screen.getAllByLabelText('like'));
    await user.click(screen.getAllByLabelText('like')[0]);
    await waitFor(() =>
      expect(screen.getByLabelText('unlike')).toBeInTheDocument());
  });

  it('unlikes a post', async () => {
    server.use(
        http.get(`${URL}/post`, () => HttpResponse.json(makePostData(true))),
        http.delete(`${URL}/post/1/like`, () =>
          HttpResponse.json({
            ...makePostData(true)[0], likes: 0, likedByMe: false})),
    );
    render(postsWrapper());
    const user = userEvent.setup();
    await waitFor(() => screen.getByLabelText('unlike'));
    await user.click(screen.getByLabelText('unlike'));
    await waitFor(() =>
      expect(screen.getAllByLabelText('like')[0]).toBeInTheDocument());
  });
});
