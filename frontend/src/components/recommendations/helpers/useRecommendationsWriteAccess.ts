import { useEffect, useState } from 'react';

import { AmazonAccount } from '@/types/user/user-amazon-account.type';

import { useAmazonAccountsQ } from '@/lib/hooks/queries/useAmazonAccounts.query';
import { useGlobalStore } from '@/lib/state-management/useGlobalStore';
import { useHydrationStore } from '@/lib/state-management/use-hydration-store.helper';

const useRecommendationsWriteAccess = () => {
  const selectedAmazonAccount = useHydrationStore(
    useGlobalStore,
    (state) => state.selectedAmazonAccount as AmazonAccount
  );
  const selectedAmazonAccountId = selectedAmazonAccount?._id || '';

  const { data: amazonAccounts } = useAmazonAccountsQ();

  const isOwnAccount = !!amazonAccounts?.find((account) => account._id === selectedAmazonAccountId);

  const [accountHasWriteAccess, setAccountHasWriteAccess] = useState(isOwnAccount ? true : false);

  useEffect(() => {
    if (
      selectedAmazonAccount &&
      !isOwnAccount &&
      selectedAmazonAccount.permission &&
      selectedAmazonAccount.permission.resolved
    ) {
      setAccountHasWriteAccess(
        selectedAmazonAccount.permission.resolved.some(
          (p) =>
            (p.name === 'recommendations' || p.name === 'recommendations_automated') &&
            p.access.includes('write')
        )
      );
    } else {
      // TODO (Markus): wurde die permission recommendation_automated eventuel ereilt für den usecase -> dann false
      setAccountHasWriteAccess(true);
    }
  }, [selectedAmazonAccount, setAccountHasWriteAccess, isOwnAccount]);

  return accountHasWriteAccess;
};

export default useRecommendationsWriteAccess;
