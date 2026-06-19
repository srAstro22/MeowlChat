import {test, expect} from 'vitest';
import {page, clickOn} from './setup';
import {login, createNewPost, createPrivatePost} from './helpers';

test('Expect Create Post Header', async () => {
  // Login
  await login(page, 'molly@books.com', 'mollymember');

  // Open My Posts
  await clickOn(page, '[aria-label="create-post"]');
  const label = await page.waitForSelector(
      '::-p-text(Create Post)', {visible: true});
  expect(label).not.toBeNull();
});

test('Fill In Fields and Expect Home', async () => {
  // Login
  await login(page, 'molly@books.com', 'mollymember');

  // Create Post
  const content = 'Random Post 1';
  await createNewPost(page, content);

  // Look for Home Header
  const label = await page.waitForSelector(
      '::-p-text(Welcome to MeowlChat)', {visible: true});
  expect(label).not.toBeNull();
});

test('Fill In Fields and Expect Post', async () => {
  // Login
  await login(page, 'molly@books.com', 'mollymember');

  // Create and Go Home
  const content = 'Sean Paul and Sasha';
  await createNewPost(page, content);

  const newPost = await page.waitForSelector(
      '::-p-text(Sean Paul and Sasha)');
  expect(newPost).not.toBeNull();
});

test('Create Post and Login as New User', async () => {
  // User 1
  await login(page, 'molly@books.com', 'mollymember');

  // Create Post
  const content = 'Test Brick 2';
  await createNewPost(page, content);

  // Logout
  await clickOn(page, '[aria-label="logout"]');

  // User 2
  await login(page, 'anna@books.com', 'annaadmin');

  // Expect Post
  const newPost = await page.waitForSelector(
      '::-p-text(Test Brick 2)');
  expect(newPost).not.toBeNull();
});


test('Create Private Post and Login as New User', async () => {
  // User 1
  await login(page, 'molly@books.com', 'mollymember');

  // Create Post
  const content = 'Private Test 1';
  await createPrivatePost(page, content);

  // Logout
  await clickOn(page, '[aria-label="logout"]');

  // User 2
  await login(page, 'anna@books.com', 'annaadmin');

  // Expect Post
  const privatePost = await page.$('::-p-text(Private Test 1)');
  expect(privatePost).toBeNull();
});
