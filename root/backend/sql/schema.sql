CREATE EXTENSION IF NOT EXISTS pgcrypto;
 
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS grouproles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS post_likes CASCADE;
 
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data JSONB
);
 
CREATE TABLE groups (
  groupid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data jsonb
);
 
CREATE TABLE grouproles (
  groupid UUID NOT NULL REFERENCES groups(groupid) ON DELETE CASCADE,
  userid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  data jsonb,
  PRIMARY KEY (groupid, userid)
);
 
CREATE TABLE posts (
  postid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  groupid UUID REFERENCES groups(groupid) ON DELETE CASCADE,
  data jsonb
);
 
CREATE TABLE post_likes (
  postid UUID NOT NULL REFERENCES posts(postid) ON DELETE CASCADE,
  userid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (postid, userid)
);