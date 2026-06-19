// This will be used when we get into requests for the app
import * as postsModel from '../model/posts.js';

/**
 *
 * @param {string} req - not used
 * @param {string} res - status
 * @returns {object} all Posts
 */
export async function getAll(req, res) {
  const user = await req.user; // from check middleware
  const posts = await postsModel.retrievePosts(user.id);
  return res.status(200).json(posts);
}

/**
 *
 * @param {string} req - currUserID
 * @param {string} res - status code
 * @returns {object} - all of my posts
 */
export async function getMyPosts(req, res) {
  const user = await req.user;
  const posts = await postsModel.retrieveMyPosts(user.id);

  return res.status(200).json(posts);
}

/**
 *
 * @param {string} req - User UUID
 * @param {string} res - Status Code
 * @returns {string} - Groups they are a part of
 */
export async function getGroups(req, res) {
  console.log("GET GROUPS USER:", req.user);
  const userID = (await req.user).id;
  const groups = await postsModel.retrieveGroups(userID);

  return res.status(200).json(groups);
}


/**
 *
 * @param {string} req - Group UUID
 * @param {string} res - Status Code
 * @returns {object} - All Posts from Named Group
 */
export async function getGroupPosts(req, res) {
  const {groupID} = req.params;
  const userID = (await req.user).id;
  const posts = await postsModel.retrieveGroupPosts(groupID, userID);

  // console.log(posts);

  return res.status(200).json([{
    groupID,
    posts,
  }]);
}

/**
 *
 * @param {string} req - Group UUID
 * @param {string} res - Status Code
 * @returns {object} - All Posts from Named Group
 */
export async function createPost(req, res) {
  const userID = (await req.user).id;
  const {groupID=null, content, isPublic} = req.body;

  const post = await postsModel.createPost(userID, groupID, content, isPublic);

  // console.log(post);

  return res.status(201).json(post);
}

/**
 *
 * @param {string} req - User UUID
 * @param {string} res - Status Code
 * @returns {object} - Liked Post
 */
export async function likePost(req, res) {
  const postID = req.params.postid;
  const userID = (await req.user).id;
  // console.log('UserID: ', userID);
  // console.log('PostID: ', postID);

  const like = await postsModel.userLikePost(postID, userID);

  return res.status(200).json(like);
}

/**
 *
 * @param {string} req - User UUID
 * @param {string} res - Status Code
 * @returns {object} - Unliked Post
 */
export async function unlikePost(req, res) {
  const postID = req.params.postid;
  const userID = (await req.user).id;

  const unlike = await postsModel.userUnlikePost(postID, userID);

  return res.status(200).json(unlike);
}
