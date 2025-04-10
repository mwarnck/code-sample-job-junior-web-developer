import { minimalRecommendation } from '../../../../../tests/db/data/recommendations';
import fakeAmazonAccount from '../../../../../tests/db/data/amazonAccount';

import { BundleSkuDialogProvider } from '../../providers/bundle-sku-dialog-provider.component';
import ProductsBundlesItem from './products-bundles.item';

export const ProductsBundlesItemUnresolved = () => {
  const recommendation = minimalRecommendation.products_bundles();
  recommendation[0].resolved = false;
  const amazonAccount = fakeAmazonAccount.minimal();
  return (
    <BundleSkuDialogProvider>
      <ProductsBundlesItem
        productData={recommendation[0]}
        amazonAccount={amazonAccount}
        isAutomated={false}
      />
    </BundleSkuDialogProvider>
  );
};
export const ProductsBundlesItemResolved = () => {
  const recommendation = minimalRecommendation.products_bundles();
  recommendation[0].resolved = true;
  const amazonAccount = fakeAmazonAccount.minimal();
  return (
    <BundleSkuDialogProvider>
      <ProductsBundlesItem
        productData={recommendation[0]}
        amazonAccount={amazonAccount}
        isAutomated={false}
      />
    </BundleSkuDialogProvider>
  );
};

export const ProductsBundlesItemResolvedWithStatus = ({ status }) => {
  const recommendation = minimalRecommendation.products_bundles();
  recommendation[0].resolved = true;
  recommendation[0].resolved_status = status;
  const amazonAccount = fakeAmazonAccount.minimal();
  return (
    <BundleSkuDialogProvider>
      <ProductsBundlesItem
        productData={recommendation[0]}
        amazonAccount={amazonAccount}
        isAutomated={false}
      />
    </BundleSkuDialogProvider>
  );
};
