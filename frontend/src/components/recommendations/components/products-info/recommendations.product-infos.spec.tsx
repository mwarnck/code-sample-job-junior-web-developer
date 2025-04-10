import { test, expect } from '@playwright/experimental-ct-react';
import { minimalRecommendation } from 'tests/db/data/recommendations';

import ProductInfos from './recommendations.product-infos.component';

const recommendation = minimalRecommendation.size_change_higher_fba();
const { name, image, asin, sku } = recommendation[0];
// FIXME: Fix this tests
test.describe('Recommendations Product-Infos Component', () => {
  test.skip('renders the product infos component', async ({ mount }) => {
    const component = await mount(
      <ProductInfos image={image} name={name} asin={asin} sku={sku} fnsku={null} />
    );

    await expect(component.getByTestId('recommendations-infos-no-image')).toBeHidden();
    await expect(component.getByTestId('recommendations-infos-image')).toBeVisible();
    await expect(component.getByTestId('recommendations-infos-asin')).toBeVisible();
    await expect(component.getByTestId('recommendations-infos-asin')).toContainText(asin);
    await expect(component.getByTestId('recommendations-infos-sku-fnsku')).toBeVisible();
    await expect(component.getByTestId('recommendations-infos-sku-fnsku')).toContainText(sku);
    await expect(component.getByTestId('recommendations-infos-name')).toBeVisible();
    await expect(component.getByTestId('recommendations-infos-name')).toContainText(
      name?.slice(0, 20)
    );
  });

  test.skip('renders the not available picture', async ({ mount }) => {
    const component = await mount(
      <ProductInfos image={null} name={name} asin={asin} sku={sku} fnsku={null} />
    );

    await expect(component.getByTestId('recommendations-infos-no-image')).toBeVisible();
  });

  test.skip('renders fnsku instead of sku', async ({ mount }) => {
    const component = await mount(
      <ProductInfos image={image} name={name} asin={asin} sku={null} fnsku={sku} />
    );

    await expect(component.getByTestId('recommendations-infos-sku-fnsku')).toContainText(sku);
  });

  test.skip('shows not available if asin is not available', async ({ mount }) => {
    const component = await mount(
      <ProductInfos image={null} name={null} asin={null} sku={null} fnsku={null} />
    );

    await expect(component.getByTestId('recommendations-infos-asin')).toContainText(
      'nicht mehr verfügbar'
    );
  });
});
