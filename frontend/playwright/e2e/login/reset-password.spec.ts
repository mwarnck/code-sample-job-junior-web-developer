import { test, expect } from '@playwright/test';
import { useUserInterceptions } from '@/playwright/interceptions/useUserInterceptions';

test.describe('Reset Password Page (Login with Token)', () => {
  test('Reset Password page should exist', async ({ browser }) => {
    const userContext = await browser.newContext({ storageState: undefined });
    const page = await userContext.newPage();

    const testToken = 'testToken'; // it can be any string to test
    await page.goto(`/login/${testToken}/SETTINGS`);
    expect(page.url()).toContain(`/login/${testToken}/SETTINGS`);
  });

  test('should be displayed a toast error message, if the token is not found', async ({
    browser
  }) => {
    const userContext = await browser.newContext({ storageState: undefined });
    const page = await userContext.newPage();

    const testToken = 'testToken'; // it can be any string to test
    await page.goto(`/login/${testToken}/SETTINGS`);
    const { postUserLoginError } = await useUserInterceptions(page);
    await postUserLoginError('user.notFound');
    expect(await page.locator('.Toastify__toast').isVisible()).toBeTruthy();
  });

  test.skip('should be redirected to Change Password Page component, if the token is found', async ({
    browser
  }) => {
    const userContext = await browser.newContext({ storageState: undefined });
    const page = await userContext.newPage();
    const testToken = 'testToken'; // it can be any string to test

    const {
      resetPasswordTokenRedirect
      //  userInterception
    } = await useUserInterceptions(page);
    // const { setGetData } = await userInterception();
    await resetPasswordTokenRedirect(testToken);
    // setGetData({});
    // await page.context().storageState({ path: './playwright/e2e/.auth/auth.json' });
    await page.goto(`/login/${testToken}/SETTINGS`);

    await page.waitForTimeout(8000);
    expect(await page.getByTestId('settings-password-change').isVisible()).toBeTruthy();
  });
});
