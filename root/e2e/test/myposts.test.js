import {test, expect} from 'vitest';
import {page, clickOn} from './setup';
import {login} from './helpers';

test('Expect My Posts Header', async () => {
  await login(page, 'molly@books.com', 'mollymember');

  await page.waitForSelector('[aria-label="my-posts"]');
  await clickOn(page, '[aria-label="my-posts"]');

  const label = await page.waitForSelector(
      '::-p-text(My Posts)', {visible: true});
  expect(label).not.toBeNull();
});

// Chat GPT Generated Test
// I kept Having Timing Issues So it Helped Resolve
test('Check My Posts are Only My Posts', async () => {
  await login(page, 'molly@books.com', 'mollymember');

  await page.waitForSelector('[aria-label="my-posts"]');
  await clickOn(page, '[aria-label="my-posts"]');

  // Wait for header confirming route change
  await page.waitForSelector('::-p-text(My Posts)', {visible: true});

  // Wait for the API to return and posts to re-render by checking
  // that at least one username is Molly — retries until true or timeout
  await page.waitForFunction(() => {
    const usernames = document.querySelectorAll('[aria-label="post-username"]');
    return usernames.length > 0 &&
      Array.from(usernames).every(
          (el) => el.textContent.trim() === 'Molly Maze');
  }, {timeout: 5000});

  // By here we already know they're all Molly — but assert anyway
  const usernames = await page.$$eval(
      '[aria-label="post-username"]',
      (els) => els.map((e) => e.textContent.trim()),
  );

  for (const name of usernames) {
    expect(name).toBe('Molly Maze');
  }
});
