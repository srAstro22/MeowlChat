import {clickOn} from './setup';

export const login = async (page, email, password) => {
  await page.waitForSelector('[aria-label="email-box"]');
  await clickOn(page, '[aria-label="email-box"]');
  await page.type('[aria-label="email-box"]', email);

  await page.waitForSelector('[aria-label="password-box"]');
  await clickOn(page, '[aria-label="password-box"]');
  await page.type('[aria-label="password-box"]', password);

  await clickOn(page, '[aria-label="login-button"]');
};

export const createNewPost = async (page, content) => {
  // Open Create Post
  await clickOn(page, '[aria-label="create-post"]');

  // Type In Content
  await clickOn(page, '[aria-label="contentField"]');
  await page.type('[aria-label="contentField"]', content);

  // Make Public
  await clickOn(page, '[aria-label="togglePublic"]');

  // Click Create, then wait for the SPA to render the home route
  await clickOn(page, '[aria-label="createButton"]');
  await page.waitForSelector(
      '::-p-text(Welcome to MeowlChat)', {visible: true});
};

export const createPrivatePost = async (page, content) => {
  // Open Create Post
  await clickOn(page, '[aria-label="create-post"]');

  // Type In Content
  await clickOn(page, '[aria-label="contentField"]');
  await page.type('[aria-label="contentField"]', content);

  // Leave it Private

  // Click Create, then wait for the SPA to render the home route
  await clickOn(page, '[aria-label="createButton"]');
  await page.waitForSelector(
      '::-p-text(Welcome to MeowlChat)', {visible: true});
};
