import {it, beforeAll,
  beforeEach, afterAll, describe, expect} from 'vitest';
import {ctx, setup, teardown, login} from './setup.js';

beforeAll(setup);
afterAll(teardown);

let request;
beforeEach(() => {
  request = ctx.request;
});

let response;
let validID;

beforeAll(() => login('molly@books.com', 'mollymember'));

beforeEach(async () => {
  response = await ctx.request.get('/api/v0/group')
      .set('Authorization', `Bearer ${ctx.token}`);
  validID = response.body[0].groupid;
});
/*
#####################
#     Group Names   #
#####################
*/
describe('Group Names', () => {
  it('Bad Token: Forbidden', async () => {
    await request.get('/api/v0/group')
        .set('Authorization', `Bearer 123`)
        .expect(403);
  });

  it('200 Success', () => {
    expect(response.status).toBe(200);
  });

  it('Expect GroupName Array', async () => {
    expect(response.body).toBeInstanceOf(Array);
  });

  it('Expect GroupName Body', async () => {
    expect(response.body.length).toBeGreaterThan(0); // At least one group
  });

  it('Expect GroupID', async () => {
    expect(response.body[0]).toHaveProperty('groupid');
  });

  it('Expect Description', async () => {
    expect(response.body[0]).toHaveProperty('description');
  });
});

/*
#####################
#     Group Posts   #
#####################
*/
describe('Group Posts', () => {
//   beforeEach(async () => {
//     response = await request.get('/api/v0/group')
//         .set('Authorization', `Bearer ${token}`);
//   });

  let groupPost;
  beforeEach(async () => {
    groupPost = await ctx.request.get(
        `/api/v0/group/${validID}/post`)
        .set('Authorization', `Bearer ${ctx.token}`);
  });

  it('200 Success', () => {
    expect(groupPost.status).toBe(200);
  });

  it('Expect GroupPost Array', async () => {
    expect(groupPost.body).toBeInstanceOf(Array);
  });

  it('Expect GroupPost Body', async () => {
    expect(groupPost.body.length).toBeGreaterThan(0); // At least one group
  });

  it('Expect GroupID', async () => {
    expect(groupPost.body[0]).toHaveProperty('groupID');
  });

  it('Expect Posts Array Pt.1', async () => {
    expect(groupPost.body[0]).toHaveProperty('posts');
    // expect(groupPost.body[0].posts).toBeInstanceOf(Array);
  });

  it('Expect Posts Array Pt.2', async () => {
    expect(groupPost.body[0].posts).toBeInstanceOf(Array);
  });

  it('Expect PostID', async () => {
    const post = groupPost.body[0].posts[0];
    expect(post).toHaveProperty('postID');
  });

  it('Expect Post userID', async () => {
    const post = groupPost.body[0].posts[0];

    expect(post).toHaveProperty('userID');
  });

  it('Expect Post Content', async () => {
    const post = groupPost.body[0].posts[0];

    expect(post).toHaveProperty('content');
  });

  it('Expect Post Boolean', async () => {
    const post = groupPost.body[0].posts[0];
    expect(post).toHaveProperty('isPublic');
  });
  it('Posts Belong To Logged In User', () => {
    groupPost.body.forEach((post) => {
      expect(post.userID).toBe(/* molly's userID */);
    });
  });
});
