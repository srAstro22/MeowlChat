import {test, expect} from 'vitest';
import {page, clickOn} from './setup';
import {login} from './helpers';

const findPostByContent = async (page, content) => {
  await page.waitForSelector('[aria-label^="post-"]', {visible: true});
  return page.evaluateHandle((content) => {
    return Array.from(document.querySelectorAll('[aria-label^="post-"]'))
        .find((el) => el.textContent.includes(content));
  }, content);
};

test('Like Aye Astro Hello World Post', async () => {
  await login(page, 'molly@books.com', 'mollymember');
  const post = await findPostByContent(page, 'Hello World!');
  const postLabel = await post.evaluate((el) => el.getAttribute('aria-label'));

  await clickOn(page, `[aria-label="${postLabel}"] [aria-label="like"]`);
  await page.waitForSelector(
      `[aria-label="${postLabel}"] [aria-label="unlike"]`, {visible: true});

  const likes = await post.$eval(
      '[aria-label="unlike"] + div',
      (el) => parseInt(el.textContent.trim()),
  );
  expect(likes).toBe(1);
});

test('Like Should Retain State through Users', async () => {
  await login(page, 'anna@books.com', 'annaadmin');
  const post = await findPostByContent(page, 'Hello World!');
  const postLabel = await post.evaluate((el) => el.getAttribute('aria-label'));

  // Like Post
  await clickOn(page, `[aria-label="${postLabel}"] [aria-label="like"]`);
  await page.waitForSelector(
      `[aria-label="${postLabel}"] [aria-label="unlike"]`, {visible: true});

  const likes = await post.$eval(
      '[aria-label="unlike"] + div',
      (el) => parseInt(el.textContent.trim()),
  );
  expect(likes).toBe(2);
});


test('Unlike Aye Astro Hello World Post', async () => {
  await login(page, 'molly@books.com', 'mollymember');
  const post = await findPostByContent(page, 'Hello World!');
  const postLabel = await post.evaluate((el) => el.getAttribute('aria-label'));

  // Unlike
  await clickOn(page, `[aria-label="${postLabel}"] [aria-label="unlike"]`);
  await page.waitForSelector(
      `[aria-label="${postLabel}"] [aria-label="like"]`, {visible: true});

  // Re-query post after re-render
  const updatedPost = await page.$(`[aria-label="${postLabel}"]`);
  const likes = await updatedPost.$eval(
      '[aria-label="like"] + div',
      (el) => parseInt(el.textContent.trim()),
  );
  expect(likes).toBe(1);
});

test('Like then Unlike', async () => {
  await login(page, 'molly@books.com', 'mollymember');
  const post = await findPostByContent(page, 'Hello World!');
  const postLabel = await post.evaluate((el) => el.getAttribute('aria-label'));

  // Like
  await clickOn(page, `[aria-label="${postLabel}"] [aria-label="like"]`);
  await page.waitForSelector(
      `[aria-label="${postLabel}"] [aria-label="unlike"]`, {visible: true});

  // Unlike
  await clickOn(page, `[aria-label="${postLabel}"] [aria-label="unlike"]`);
  await page.waitForSelector(
      `[aria-label="${postLabel}"] [aria-label="like"]`, {visible: true});

  // Re-query post after re-render
  const updatedPost = await page.$(`[aria-label="${postLabel}"]`);
  const likes = await updatedPost.$eval(
      '[aria-label="like"] + div',
      (el) => parseInt(el.textContent.trim()),
  );
  expect(likes).toBe(1);
});

test('Like Multiple Posts', async () => {
  await login(page, 'molly@books.com', 'mollymember');
  const post = await findPostByContent(page, 'Hello World!');
  const postLabel = await post.evaluate((el) => el.getAttribute('aria-label'));

  // Like
  await clickOn(page, `[aria-label="${postLabel}"] [aria-label="like"]`);
  await page.waitForSelector(
      `[aria-label="${postLabel}"] [aria-label="unlike"]`, {visible: true});

  const post2 = await findPostByContent(page, 'Just ate Steak Frites #Yummy');
  const postLabel2 = await
  post2.evaluate((el) => el.getAttribute('aria-label'));

  // Like
  await clickOn(page, `[aria-label="${postLabel2}"] [aria-label="like"]`);
  await page.waitForSelector(
      `[aria-label="${postLabel2}"] [aria-label="unlike"]`, {visible: true});

  // Re-query post after re-render
  const updatedPost = await page.$(`[aria-label="${postLabel2}"]`);
  const likes = await updatedPost.$eval(
      '[aria-label="unlike"] + div',
      (el) => parseInt(el.textContent.trim()),
  );
  expect(likes).toBe(1);
});
