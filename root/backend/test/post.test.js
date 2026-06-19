import {it, beforeAll,
  beforeEach, afterAll, describe, expect} from 'vitest';
import {ctx, setup, teardown} from './setup.js';

beforeAll(setup);
afterAll(teardown);

let request;
beforeEach(() => {
  request = ctx.request;
});

let response;
let token;

beforeAll(async () => {
  // Log in and store the JWT
  const res = await ctx.request
      .post('/api/v0/login')
      .send({
        email: 'molly@books.com',
        password: 'mollymember',
      });

  token = res.body.accessToken; // store token for later
});


/*
#####################
#        Posts      #
#####################
*/
describe('General Post API', () => {
  beforeEach(async () => {
    response = await ctx.request.get('/api/v0/post')
        .set('Authorization', `Bearer ${token}`);
  });

  it('Bad Token: Forbidden', async () => {
    await request.get('/api/v0/post')
        .set('Authorization', `Bearer 123`)
        .expect(403);
  });

  it('401 Invalid Credentials', async () => {
    await request.get('/api/v0/post')
        .expect(401);
  });

  it('200 Success', () => {
    expect(response.status).toBe(200);
  });

  it('Expect Post Array', async () => {
    expect(response.body).toBeInstanceOf(Array);
  });

  it('Expect Post Body', async () => {
    expect(response.body.length).toBeGreaterThan(0); // there is at least 1 post
  });

  it('Expect Post ID', async () => {
    expect(response.body[0]).toHaveProperty('postID');
  });

  it('Expect Post Content', async () => {
    expect(response.body[0]).toHaveProperty('content');
  });
});

describe('My Posts', () => {
  beforeEach(async () => {
    response = await ctx.request.get('/api/v0/post/mine')
        .set('Authorization', `Bearer ${token}`);
  });

  it('200 Success', () => {
    expect(response.status).toBe(200);
  });

  it('All posts belong to the logged in user', async () => {
    const firstUser = response.body[0].userID;

    for (const post of response.body) {
      expect(post.userID).toBe(firstUser);
    }
  });
});

describe('Create Post', () => {
  beforeEach(async () => {
    response = await ctx.request.post('/api/v0/post')
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'New Post hehe',
          isPublic: true,
        });
  });

  it('201 Created', () => {
    expect(response.status).toBe(201);
  });

  it('Returns a postID', () => {
    expect(response.body).toHaveProperty('postID');
  });

  it('Expect Post Content', async () => {
    expect(response.body.content).toBe('New Post hehe');
  });

  it('Expect Public True', async () => {
    expect(response.body.isPublic).toBe(true);
  });
});

describe('Create Post with Missing Field', () => {
  it('400 Public Field Missing', async () => {
    const res = await ctx.request.post('/api/v0/post')
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'New Post hehe',
        });
    expect(res.body.errors[0].path).toBe('/body/isPublic');
  });

  it('400 No Content Field', async () => {
    const res = await ctx.request.post('/api/v0/post')
        .set('Authorization', `Bearer ${token}`)
        .send({
          isPublic: true,
        });

    expect(res.status).toBe(400);
  });

  it('400 Undefined isPublic Field', async () => {
    const res = await ctx.request.post('/api/v0/post')
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'Valid Content',
          isPublic: undefined,
        });

    expect(res.status).toBe(400);
  });
});

describe('Like or Unlike', () => {
  let postid;
  beforeAll(async () => {
    // create a post to like
    const res = await ctx.request.post('/api/v0/post')
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'Post to like',
          isPublic: true,
        });

    postid = res.body.postID; // save id
  });

  describe('Like Post', () => {
    beforeEach(async () => {
      response = await ctx.request.post(`/api/v0/post/${postid}/like`)
          .set('Authorization', `Bearer ${token}`)
          .expect(200);
    });

    it('Expect Like to Be 1', () => {
      expect(response.body.likes).toBe(1);
    });
  });

  describe('Unlike Post', () => {
    beforeEach(async () => {
      response = await ctx.request.delete(`/api/v0/post/${postid}/like`)
          .set('Authorization', `Bearer ${token}`)
          .expect(200);
    });

    it('Expect Like to Be 1', () => {
      expect(response.body.likes).toBe(0);
    });
  });
});
