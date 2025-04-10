import { test, expect } from '@playwright/experimental-ct-react';
import { CONFIG } from '@/lib/config/config';

import {
  ProductsBundlesItemResolved,
  ProductsBundlesItemResolvedWithStatus,
  ProductsBundlesItemUnresolved
} from './products-bundles.item.story';

test.describe('ProductsBundles Item', () => {
  test('renders the modal-button if recommendation is not resolved', async ({ mount }) => {
    const component = await mount(<ProductsBundlesItemUnresolved />);
    await expect(component.getByTestId('products_bundles_details_button')).toBeVisible();
  });
  test('dont renders the modal-button if recommendation is resolved', async ({ mount }) => {
    const component = await mount(<ProductsBundlesItemResolved />);
    await expect(component.getByTestId('products_bundles_details_button')).toBeHidden();
  });
  test('not renders the bundle sku textfield if recommendation is resolved with status other than done', async ({
    mount
  }) => {
    const component = await mount(<ProductsBundlesItemResolvedWithStatus status='already_done' />);
    await expect(component.getByTestId('bundle-sku-textfield')).toBeHidden();
  });
  test('renders the bundle sku textfield if recommendation is resolved with status done', async ({
    mount
  }) => {
    const component = await mount(<ProductsBundlesItemResolvedWithStatus status='done' />);
    await expect(component.getByTestId('bundle-sku-textfield')).toBeVisible();
  });

  test('should render the bundle sku dialog when select status done in dropdown', async ({
    mount,
    page
  }) => {
    let isPatchUpdateCalled;
    await page.route(
      `${CONFIG.API.ENDPOINT}${CONFIG.API.METHODS.RECOMMENDATIONS.UPDATE_STATUS}`,
      (route) => {
        isPatchUpdateCalled = true;
        return route.fulfill({
          status: 200,
          body: JSON.stringify({
            data: []
          })
        });
      }
    );

    const component = await mount(<ProductsBundlesItemUnresolved />);

    await expect(component.getByTestId('select-status')).toHaveAttribute('value', 'empty');
    await component.getByLabel('Status').click();
    await expect(page.getByTestId('select-option-done')).toBeVisible();
    await page.getByTestId('select-option-done').click();
    //check if the post request was sent
    await expect(isPatchUpdateCalled).toBe(true);
    await expect(page.getByTestId('bundle-sku-dialog')).toBeVisible();
  });

  test('checks the value change of the dropdown', async ({ mount, page }) => {
    let isPatchUpdateCalled;
    await page.route(
      `${CONFIG.API.ENDPOINT}${CONFIG.API.METHODS.RECOMMENDATIONS.UPDATE_STATUS}`,
      (route) => {
        isPatchUpdateCalled = true;
        return route.fulfill({
          status: 200,
          body: JSON.stringify({
            data: []
          })
        });
      }
    );
    const component = await mount(<ProductsBundlesItemUnresolved />);

    await expect(component.getByTestId('select-status')).toHaveAttribute('value', 'empty');
    await component.getByTestId('select-value').click();
    await page.getByTestId('select-option-done').click();

    //check if the post request was sent
    await expect(isPatchUpdateCalled).toBe(true);
  });

  test('shows the modal after click on details', async ({ mount, page }) => {
    const component = await mount(<ProductsBundlesItemUnresolved />);

    await component.getByTestId('products_bundles_details_button').click();
    await expect(page.getByTestId('products_bundles_modal')).toBeVisible();
  });
});
