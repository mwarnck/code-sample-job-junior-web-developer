import { CONFIG } from '@/lib/config/config';
import { test, expect } from '@playwright/experimental-ct-react';
import {
  InboundLablesLowFbaStockItemResolved,
  InboundLablesLowFbaStockItemUnresolved
} from './inbound-labels-low-fba-stock.item.story';

test.describe('InboundLabelsLowFbaStock Item', () => {
  test('renders the modal-button if recommendation is not resolved', async ({ mount }) => {
    const component = await mount(<InboundLablesLowFbaStockItemUnresolved />);
    await expect(
      component.getByTestId('inbound_labels_low_fba_stock_details_button')
    ).toBeVisible();
  });
  test('dont renders the modal-button if recommendation is resolved', async ({ mount }) => {
    const component = await mount(<InboundLablesLowFbaStockItemResolved />);
    await expect(component.getByTestId('inbound_labels_low_fba_stock_details_button')).toBeHidden();
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
    const component = await mount(<InboundLablesLowFbaStockItemUnresolved />);
    await expect(component.getByTestId('select-status')).toHaveAttribute('value', 'empty');
    await component.getByTestId('select-value').click();
    await page.getByTestId('select-option-sold_out').click();
    //check if the post request was sent
    await expect(isPatchUpdateCalled).toBe(true);
  });
  test('shows the modal after click on details', async ({ mount, page }) => {
    const component = await mount(<InboundLablesLowFbaStockItemUnresolved />);
    await component.getByTestId('inbound_labels_low_fba_stock_details_button').click();
    await expect(page.getByTestId('inbound_labels_low_fba_stock_modal')).toBeVisible();
  });
});
