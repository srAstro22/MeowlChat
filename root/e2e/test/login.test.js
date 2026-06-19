import {test, expect} from 'vitest';
import {page, clickOn} from './setup';
import {login} from './helpers';

test('Initial View', async () => {
  const label = await page.waitForSelector(
      '::-p-text(MeowlChat)');
  expect(label).not.toBeNull();
  label.dispose();
});

test('Login with Known User', async () => {
  await login(page, 'molly@books.com', 'mollymember');
  const label = await page.waitForSelector('::-p-text(Welcome to MeowlChat)');
  expect(label).not.toBeNull();
});

test('Login with Unknown User', async () => {
  await login(page, 'wrong@email.com', 'wrongpassword');
  const label = await page.waitForSelector('::-p-text(Invalid Credentials)');
  expect(label).not.toBeNull();
});

test('Logout', async () => {
  await login(page, 'molly@books.com', 'mollymember');
  await clickOn(page, '[aria-label="logout"]');
  const label = await page.waitForSelector('::-p-text(MeowlChat)',
      {timeout: 5000});
  expect(label).not.toBeNull();
});
