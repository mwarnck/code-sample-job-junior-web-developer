import { messages, minimalRecommendation } from '../../../../../tests/db/data/recommendations';
import fakeAmazonAccount from '../../../../../tests/db/data/amazonAccount';
import FbaMissingInboundItem from './fba-missing-inbound.item';

export const FbaMissingInboundItemUnresolved = () => {
  const recommendation = minimalRecommendation.fba_missing_inbound();
  recommendation[0].resolved = false;
  const amazonAccount = fakeAmazonAccount.minimal();
  return (
    <FbaMissingInboundItem
      productData={recommendation[0]}
      amazonAccount={amazonAccount}
      isAutomated={false}
      isOnboarding={false}
    />
  );
};
export const FbaMissingInboundItemResolved = () => {
  const recommendation = minimalRecommendation.fba_missing_inbound();
  recommendation[0].resolved = true;
  const amazonAccount = fakeAmazonAccount.minimal();
  return (
    <FbaMissingInboundItem
      productData={recommendation[0]}
      amazonAccount={amazonAccount}
      isAutomated={false}
      isOnboarding={false}
    />
  );
};
export const FbaMissingInboundItemWithCaseId = () => {
  const recommendation = minimalRecommendation.fba_missing_inbound();
  recommendation[0].resolved = false;
  recommendation[0].case_id = '0987654321';
  const amazonAccount = fakeAmazonAccount.minimal();
  return (
    <FbaMissingInboundItem
      productData={recommendation[0]}
      amazonAccount={amazonAccount}
      isAutomated={false}
      isOnboarding={false}
    />
  );
};

export const FbaMissingInboundItemAutomatedLastMessageArthy = () => {
  const recommendation = minimalRecommendation.fba_missing_inbound();
  recommendation[0].resolved = false;
  recommendation[0]._id = '0987654321';
  const amazonAccount = fakeAmazonAccount.minimal();
  const recommendationWithMessages = {
    ...recommendation[0],
    is_last_message_from_automation: true,
    messages
  };

  return (
    <FbaMissingInboundItem
      productData={recommendationWithMessages}
      amazonAccount={amazonAccount}
      isAutomated={true}
      isOnboarding={false}
    />
  );
};

export const FbaMissingInboundItemAutomatedLastMessageUser = () => {
  const recommendation = minimalRecommendation.fba_missing_inbound();
  recommendation[0].resolved = false;
  recommendation[0]._id = '1234567890';
  const amazonAccount = fakeAmazonAccount.minimal();
  const recommendationWithMessages = {
    ...recommendation[0],
    messages: [
      {
        created_at: '23.08.2023, 10:57 ',
        updated_at: '123',
        sender: '5c3c8bfa7340ad438fe416ad',
        receiver: '64b52e06f81a1ede5b910f36',
        text: 'Vincent tu was für dein Geld!',
        files: [
          'https://uploads.amz.tools/service-providers/unicon/LP_VuBs+neu+Dez.pdf',
          'https://uploads.amz.tools/service-providers/unicon/LP_VuBs+neu+Dez.pdf'
        ]
      },
      ...messages
    ]
  };
  return (
    <FbaMissingInboundItem
      productData={recommendationWithMessages}
      amazonAccount={amazonAccount}
      isAutomated={true}
      isOnboarding={false}
    />
  );
};
