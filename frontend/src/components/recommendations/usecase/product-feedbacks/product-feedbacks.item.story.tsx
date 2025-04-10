import { minimalRecommendation } from '../../../../../tests/db/data/recommendations';
import fakeAmazonAccount from '../../../../../tests/db/data/amazonAccount';
import { ProductFeedbacksItem } from './product-feedbacks.item';
import userWithSomeAccounts from '../../../../../tests/db/data/user-with-some-accounts';

export const ProductFeedbacksItemUnresolved = () => {
  const recommendation = minimalRecommendation.product_feedbacks();
  recommendation[0].resolved = false;
  const amazonAccount = fakeAmazonAccount.minimal();
  const user = userWithSomeAccounts(1, 2)?.currentUser;
  return (
    <ProductFeedbacksItem
      productData={recommendation[0]}
      amazonAccount={amazonAccount}
      isAutomated={false}
      // @ts-ignore
      user={user}
    />
  );
};
export const ProductFeedbacksItemResolved = () => {
  const recommendation = minimalRecommendation.product_feedbacks();
  recommendation[0].resolved = true;
  const amazonAccount = fakeAmazonAccount.minimal();
  const user = userWithSomeAccounts(1, 2)?.currentUser;
  return (
    <ProductFeedbacksItem
      productData={recommendation[0]}
      amazonAccount={amazonAccount}
      isAutomated={false}
      // @ts-ignore
      user={user}
    />
  );
};
