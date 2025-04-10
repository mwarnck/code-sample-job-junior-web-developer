import { test, expect } from '@playwright/experimental-ct-react';

import {
  ProductFeedbacksItemResolved,
  ProductFeedbacksItemUnresolved
} from './product-feedbacks.item.story';

test.describe('ProductFeedbacksComponent Item', () => {
  test('renders the modal-button if the recommendation is not resolved', async ({ mount }) => {
    const component = await mount(<ProductFeedbacksItemUnresolved />);
    await expect(component.getByTestId('product_feedbacks_details_button')).toBeVisible();
  });

  test('dont renders the modal-button if the recommendation is resolved', async ({ mount }) => {
    const component = await mount(<ProductFeedbacksItemResolved />);
    await expect(component.getByTestId('product_feedbacks_details_button')).toBeHidden();
  });

  test('checks the value change of the dropdown', async ({ mount }) => {
    const component = await mount(<ProductFeedbacksItemUnresolved />);
    await expect(component.getByTestId('select-status')).toHaveAttribute('value', 'empty');
  });

  test('shows the modal after click on details', async ({ mount, page }) => {
    const component = await mount(<ProductFeedbacksItemUnresolved />);
    await component.getByTestId('product_feedbacks_details_button').click();
    // Modal ist innerhalb der component immer hidden...page muss verwendet werden...
    await expect(page.getByTestId('product_feedbacks_modal')).toBeVisible();
  });
});
