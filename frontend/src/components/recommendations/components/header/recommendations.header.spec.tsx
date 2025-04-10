import { test, expect } from '@playwright/experimental-ct-react';
import { RecommendationsHeaderForTests } from './recommendations.header.story';

test.describe('Recommendations header component', () => {
  test.describe('Progress block', () => {
    test('the progress block in the header should be visible for usual user', async ({ mount }) => {
      const component = await mount(
        <RecommendationsHeaderForTests isAutomationAccount={false} isSelectedAccountPaid={false} />
      );

      await expect(component.getByTestId('recommendations-header-progress-block')).toBeVisible();
    });

    test('the progress block in the header should not be visible for automation user', async ({
      mount
    }) => {
      const component = await mount(
        <RecommendationsHeaderForTests isAutomationAccount={true} isSelectedAccountPaid={false} />
      );
      await expect(component.getByTestId('recommendations-header-progress-block')).toBeHidden();
    });
  });

  test.describe('Edit ability', () => {
    test(`checks if the Accordion is disabled for unpaid users`, async ({ mount }) => {
      const component = await mount(
        <RecommendationsHeaderForTests isAutomationAccount={false} isSelectedAccountPaid={false} />
      );
      await expect(component.getByTestId('recommendations-headline')).toBeDisabled();
    });
    test(`checks if the Accordion is not disabled for paid users`, async ({ mount }) => {
      const component = await mount(
        <RecommendationsHeaderForTests isAutomationAccount={false} isSelectedAccountPaid={true} />
      );
      await expect(component.getByTestId('recommendations-headline')).not.toBeDisabled();
    });
  });
});
