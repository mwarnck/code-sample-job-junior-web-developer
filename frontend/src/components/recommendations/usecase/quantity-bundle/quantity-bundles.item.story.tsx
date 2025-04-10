import { minimalRecommendation } from '../../../../../tests/db/data/recommendations';
import fakeAmazonAccount from '../../../../../tests/db/data/amazonAccount';
import QuantityBundlesItem from './quantity-bundle.item';
import { BundleSkuDialogProvider } from '../../providers/bundle-sku-dialog-provider.component';

export const QuantityBundlesItemUnresolved = () => {
  const recommendation = minimalRecommendation.quantity_bundles();
  recommendation[0].resolved = false;
  const amazonAccount = fakeAmazonAccount.minimal();
  return (
    <BundleSkuDialogProvider>
      <QuantityBundlesItem
        productData={recommendation[0]}
        amazonAccount={amazonAccount}
        isAutomated={false}
      />
    </BundleSkuDialogProvider>
  );
};
export const QuantityBundlesItemResolved = () => {
  const recommendation = minimalRecommendation.quantity_bundles();
  recommendation[0].resolved = true;
  const amazonAccount = fakeAmazonAccount.minimal();
  return (
    <BundleSkuDialogProvider>
      <QuantityBundlesItem
        productData={recommendation[0]}
        amazonAccount={amazonAccount}
        isAutomated={false}
      />
    </BundleSkuDialogProvider>
  );
};

export const QuantityBundlesItemResolvedWithStatus = ({ status }) => {
  const recommendation = minimalRecommendation.quantity_bundles();
  recommendation[0].resolved = true;
  recommendation[0].resolved_status = status;
  const amazonAccount = fakeAmazonAccount.minimal();
  return (
    <BundleSkuDialogProvider>
      <QuantityBundlesItem
        productData={recommendation[0]}
        amazonAccount={amazonAccount}
        isAutomated={false}
      />
    </BundleSkuDialogProvider>
  );
};
