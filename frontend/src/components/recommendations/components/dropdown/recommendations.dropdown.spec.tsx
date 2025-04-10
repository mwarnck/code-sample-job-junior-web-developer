import { test, expect } from '@playwright/experimental-ct-react';

import {
  DropdownWithoutStatusAndAutomatedFalse,
  DropdownWithoutStatusAndAutomatedTrue
} from './recommendations.dropdown.story';

test.describe('Recommendations dropdown', () => {
  test('renders the dropdown with the current status if automation is not active', async ({
    mount
  }) => {
    const component = await mount(<DropdownWithoutStatusAndAutomatedFalse />);
    await expect(component.getByTestId('recommendation-status-automated')).not.toBeVisible();
    await expect(component.getByTestId('select-status')).toHaveAttribute('value', 'empty');
  });
  test('renders a paragraph with the current status if automation is active', async ({ mount }) => {
    const component = await mount(<DropdownWithoutStatusAndAutomatedTrue />);
    await expect(component.getByTestId('recommendation-status-automated')).toBeVisible();
  });
});
