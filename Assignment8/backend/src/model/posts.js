import {pool} from './pool.js';

/**
 * Retrieve posts that are either public or belong to the curr user
 * @param {string} userID - current logged-in user's ID
 * @returns {object} filtered posts
 */
export async function retrievePosts(userID) {
  const postsQuery = `
    SELECT
        p.postid AS "postID",
        u.id AS "userID",
        u.data->'user'->>'name' AS username,
        u.data->'user'->>'email' AS email,
        p.data->>'content' AS "content",
        p.data->>'date-posted' AS "date",
        (p.data->>'ispublic')::boolean AS "isPublic",
        COALESCE((p.data->>'likes')::int, 0) AS likes,
        EXISTS (
          SELECT 1 FROM post_likes
          WHERE postid = p.postid AND userid = $1
        ) AS "likedByMe"
    FROM posts p
    JOIN users u ON u.id = p.userid
    WHERE (p.data->>'ispublic')::boolean = true
       OR u.id = $1
    ORDER BY (p.data->>'date-posted')::timestamptz DESC;
  `;

  const {rows} = await pool.query(postsQuery, [userID]);
  return rows;
}

/**
 * Grabs Groups they are in
 * @param {string} userID - Current User UUID
 * @returns {object} User's Groups
 */
export async function retrieveMyPosts(userID) {
  const query = `
    SELECT
        p.postid AS "postID",
        u.id AS "userID",
        u.data->'user'->>'name' AS username,
        u.data->'user'->>'email' AS email,
        p.data->>'content' AS "content",
        p.data->>'date-posted' AS "date",
        (p.data->>'ispublic')::boolean AS "isPublic",
        COALESCE((p.data->>'likes')::int, 0) AS likes,
        EXISTS (
          SELECT 1 FROM post_likes
          WHERE postid = p.postid AND userid = $1
        ) AS "likedByMe"
    FROM posts p
    JOIN users u ON u.id = p.userid
    WHERE p.userid = $1
    ORDER BY (p.data->>'date-posted')::timestamptz DESC;
  `;

  const {rows} = await pool.query(query, [userID]);
  return rows;
}


/**
 * Grabs Groups they are in
 * @param {string} userID - User UUID
 * @returns {object} User's Groups
 */
export async function retrieveGroups(userID) {
  const result = await pool.query(`
    SELECT
      g.groupid,
      g.data->>'groupname' AS groupname,
      g.data->>'description' AS description
    FROM groups g
    INNER JOIN grouproles gr ON gr.groupid = g.groupid
    WHERE gr.userid = $1
      AND gr.data->>'role' IN ('member', 'owner');
  `, [userID]);
  return result.rows;
}

/**
 *
 * @param {string} groupID - Group UUID
 * @param {string} userID - User UUID
 * @returns {object} Group Posts
 */
export async function retrieveGroupPosts(groupID, userID) {
  const query = `
    SELECT
      p.postid AS "postID",
      p.userid AS "userID",
      u.data->'user'->>'name' AS "username",
      u.data->'user'->>'email' AS "email",
      p.data->>'content' AS "content",
      p.data->>'date-posted' AS "date",
      (p.data->>'ispublic')::boolean AS "isPublic",
      COALESCE((p.data->>'likes')::int, 0) AS likes,
      EXISTS (
        SELECT 1 FROM post_likes
        WHERE postid = p.postid AND userid = $2
      ) AS "likedByMe"
    FROM posts p
    JOIN users u ON p.userid = u.id
    WHERE p.groupid = $1
    AND (
      (p.data->>'ispublic')::boolean = true
      OR p.userid = $2
    )    
    ORDER BY (p.data->>'date-posted')::timestamptz DESC;
  `;

  const result = await pool.query(query, [groupID, userID]);
  return result.rows;
}

/**
 *
 * @param {string} userID - User UUID
 * @param {string} groupID - Group UUID
 * @param {string} content - Post Content
 * @param {boolean} isPublic - Public/Private
 * @returns {object} full Post Data
 */
export async function createPost(userID, groupID = null, content, isPublic) {
  const query = `
    INSERT INTO posts (userid, groupid, data)
    VALUES ($1, $2, json_build_object(
      'content', $3::text,
      'date-posted', NOW()::timestamptz,
      'ispublic', $4::boolean
    ))
    RETURNING postid AS "postID"
  `;

  const values = [userID, groupID ?? null, content, isPublic];

  const {rows} = await pool.query(query, values);
  const postID = rows[0].postID;

  // Select Newly Created Post and Fill With Info
  const postQuery = `
    SELECT
        p.postid AS "postID",
        u.id AS "userID",
        u.data->'user'->>'name' AS username,
        u.data->'user'->>'email' AS email,
        p.data->>'content' AS "content",
        p.data->>'date-posted' AS "date",
        (p.data->>'ispublic')::boolean AS "isPublic",
        COALESCE((p.data->>'likes')::int, 0) AS likes,
        EXISTS (
          SELECT 1 FROM post_likes
          WHERE postid = p.postid AND userid = $2
        ) AS "likedByMe"
    FROM posts p
    JOIN users u ON u.id = p.userid
    WHERE p.postid = $1
  `;

  const {rows: postRows} = await pool.query(postQuery, [postID, userID]);
  return postRows[0];
}

/**
 *
 * @param {string} postID - Post UUID
 * @param {string} userID - User UUID
 * @returns {object} Post Data
 */
export async function userLikePost(postID, userID) {
  // Insert into post_likes table
  const likeQuery = `
    INSERT INTO post_likes (postid, userid)
    VALUES ($1, $2)
    ON CONFLICT DO NOTHING
  `;
  await pool.query(likeQuery, [postID, userID]);

  // Update the likes counter
  // Chat GPT Helped Me with This Query
  // Note To Self:
  // Counting table elements
  // Instead of incrementing, helps prevent race conditions
  const updateQuery = `
    UPDATE posts
    SET data = jsonb_set(
      data,
      '{likes}',
      to_jsonb((SELECT COUNT(*) FROM post_likes WHERE postid = $1))
    )
    WHERE postid = $1
  `;
  await pool.query(updateQuery, [postID]);

  // Return Full Post
  const postQuery = `
    SELECT
      p.postid AS "postID",
      u.id AS "userID",
      u.data->'user'->>'name' AS username,
      u.data->'user'->>'email' AS email,
      p.data->>'content' AS "content",
      p.data->>'date-posted' AS "date",
      (p.data->>'ispublic')::boolean AS "isPublic",
      COALESCE((p.data->>'likes')::int, 0) AS likes
    FROM posts p
    JOIN users u ON u.id = p.userid
    WHERE p.postid = $1
  `;
  const {rows} = await pool.query(postQuery, [postID]);
  return {...rows[0], likedByMe: true};
}

/**
 *
 * @param {string} postID - Post UUID
 * @param {string} userID - User UUID
 * @returns {object} Post Data
 */
export async function userUnlikePost(postID, userID) {
  // Insert into post_likes table
  const unlikeQuery = `
    DELETE 
    FROM post_likes 
    WHERE postid = $1 AND userid = $2
  `;
  await pool.query(unlikeQuery, [postID, userID]);

  // Update the likes counter
  const updateQuery = `
    UPDATE posts
    SET data = jsonb_set(
      data,
      '{likes}',
      to_jsonb((SELECT COUNT(*) FROM post_likes WHERE postid = $1))
    )
    WHERE postid = $1
  `;
  await pool.query(updateQuery, [postID]);

  // Return the full post in correct format
  const postQuery = `
    SELECT
      p.postid AS "postID",
      u.id AS "userID",
      u.data->'user'->>'name' AS username,
      u.data->'user'->>'email' AS email,
      p.data->>'content' AS "content",
      p.data->>'date-posted' AS "date",
      (p.data->>'ispublic')::boolean AS "isPublic",
      COALESCE((p.data->>'likes')::int, 0) AS "likes"
    FROM posts p
    JOIN users u ON u.id = p.userid
    WHERE p.postid = $1
  `;
  const {rows} = await pool.query(postQuery, [postID]);
  return {...rows[0], likedByMe: false};
}
