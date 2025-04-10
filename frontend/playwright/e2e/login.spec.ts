import { test, expect } from '@playwright/test';

import { CONFIG } from '@/lib/config/config';
import {
  TEST_PASSWORD,
  TEST_USERNAME,
  TEST_USERNAME_WRONG,
  TEST_PASSWORD_WRONG
} from '@/cypress/utils/testConstants';
import { useUserInterceptions } from '../interceptions/useUserInterceptions';
import { AuthActions } from '../utils/auth-actions';

test.describe('Login with session', () => {
  test('should login and redirect to the dashboard page', async ({ page, context }) => {
    const authActions = new AuthActions(page, context);
    await authActions.loginWithSession();
  });

  test('should logout and redirect to the login page', async ({ page, context }) => {
    const authActions = new AuthActions(page, context);
    await authActions.logout();
  });
});

test.describe('Login failed', () => {
  test('redirect to login page if not logged in with session', async ({ browser }) => {
    const userContext = await browser.newContext({ storageState: undefined });
    const page = await userContext.newPage();
    await page.goto('/');
    await page.waitForURL(CONFIG.URL.LOGIN.path);
    expect(page.url()).toContain(CONFIG.URL.LOGIN.path);
  });

  test('should show error message for user not found', async ({ browser }) => {
    const userContext = await browser.newContext({ storageState: undefined });
    const page = await userContext.newPage();
    const { postUserLoginError } = await useUserInterceptions(page);
    await postUserLoginError('user.notFound');
    await page.goto(CONFIG.URL.LOGIN.path);

    // Fill in username and password fields with wrong values
    await page.locator("input[name='username']").fill(TEST_USERNAME_WRONG);
    await page.locator("input[name='password']").fill(TEST_PASSWORD);
    await page.click("button[type='submit']");
    await page.waitForTimeout(8000);
    expect(await page.locator('.Toastify__toast').isVisible());
  });

  test('should show error message for wrong password', async ({ browser }) => {
    const userContext = await browser.newContext({ storageState: undefined });
    const page = await userContext.newPage();
    const { postUserLoginError } = await useUserInterceptions(page);
    await postUserLoginError('user.passwordWrong');

    await page.goto(CONFIG.URL.LOGIN.path);
    await page.locator("input[name='username']").fill(TEST_USERNAME);
    await page.locator("input[name='password']").fill(TEST_PASSWORD_WRONG);
    await page.click("button[type='submit']");
    await page.waitForTimeout(8000);
    expect(await page.locator('.Toastify__toast').isVisible());
  });
});
