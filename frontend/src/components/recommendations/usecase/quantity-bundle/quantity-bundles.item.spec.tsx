import { test, expect } from '@playwright/experimental-ct-react';
import {
  QuantityBundlesItemResolved,
  QuantityBundlesItemResolvedWithStatus,
  QuantityBundlesItemUnresolved
} from './quantity-bundles.item.story';
import { CONFIG } from '@/lib/config/config';

test.describe('QuantityBundles Item', () => {
  test('renders the modal-button if recommendation is not resolved', async ({ mount }) => {
    const component = await mount(<QuantityBundlesItemUnresolved />);

    await expect(component.getByTestId('quantity_bundles_details_button')).toBeVisible();
  });

  test('dont renders the modal-button if recommendation is resolved', async ({ mount }) => {
    const component = await mount(<QuantityBundlesItemResolved />);
    await expect(component.getByTestId('quantity_bundles_details_button')).toBeHidden();
  });

  test('not renders the bundle sku textfield if recommendation is resolved with status other than done', async ({
    mount
  }) => {
    const component = await mount(<QuantityBundlesItemResolvedWithStatus status='already_done' />);
    await expect(component.getByTestId('bundle-sku-textfield')).toBeHidden();
  });

  test('renders the bundle sku textfield if recommendation is resolved with status done', async ({
    mount
  }) => {
    const component = await mount(<QuantityBundlesItemResolvedWithStatus status='done' />);
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
    const component = await mount(<QuantityBundlesItemUnresolved />);
    await expect(component.getByTestId('select-status')).toHaveAttribute('value', 'empty');
    await component.getByLabel('Status').click();
    await expect(page.getByTestId('select-option-done')).toBeVisible();
    await page.getByTestId('select-option-done').click();
    //check if the post request was sent
    expect(isPatchUpdateCalled).toBe(true);
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
    const component = await mount(<QuantityBundlesItemUnresolved />);
    await expect(component.getByTestId('select-status')).toHaveAttribute('value', 'empty');
    await component.getByTestId('select-value').click();
    await page.getByTestId('select-option-done').click();
    //check if the post request was sent
    expect(isPatchUpdateCalled).toBe(true);
  });

  test('shows the modal after click on details', async ({ mount, page }) => {
    const component = await mount(<QuantityBundlesItemUnresolved />);
    await component.getByTestId('quantity_bundles_details_button').click();
    await expect(page.getByTestId('quantity_bundles_modal')).toBeVisible();
  });
});
