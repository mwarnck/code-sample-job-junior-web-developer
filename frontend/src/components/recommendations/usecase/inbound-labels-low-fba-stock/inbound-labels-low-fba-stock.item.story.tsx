import { minimalRecommendation } from '../../../../../tests/db/data/recommendations';
import fakeAmazonAccount from '../../../../../tests/db/data/amazonAccount';
import userWithSomeAccounts from '../../../../../tests/db/data/user-with-some-accounts';
import InboundLabelsLowFbaStockItem from './inbound-labels-low-fba-stock.item';

export const InboundLablesLowFbaStockItemUnresolved = () => {
  const recommendation = minimalRecommendation.inbound_labels_low_fba_stock();
  recommendation[0].resolved = false;
  const amazonAccount = fakeAmazonAccount.minimal();
  const user = userWithSomeAccounts(1, 2)?.currentUser;
  return (
    <InboundLabelsLowFbaStockItem
      productData={recommendation[0]}
      amazonAccount={amazonAccount}
      isAutomated={false}
      // @ts-ignore
      user={user}
    />
  );
};
export const InboundLablesLowFbaStockItemResolved = () => {
  const recommendation = minimalRecommendation.inbound_labels_low_fba_stock();
  recommendation[0].resolved = true;
  const amazonAccount = fakeAmazonAccount.minimal();
  const user = userWithSomeAccounts(1, 2)?.currentUser;
  return (
    <InboundLabelsLowFbaStockItem
      productData={recommendation[0]}
      amazonAccount={amazonAccount}
      isAutomated={false}
      // @ts-ignore
      user={user}
    />
  );
};
