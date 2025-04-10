import React, { useEffect, useState } from 'react';
import { Box, Container } from '@mui/material';
import { useFlag as _useFlag, useFlag } from '@unleash/proxy-client-react';
import { formatReactQuery } from '@/lib/helpers/utils/formatReactQuery';
import { useAmazonAccountsQ as _useAmazonAccountsQ } from '@/lib/hooks/queries/useAmazonAccounts.query';
import { useSelectedAccPaidStatusQ as _useSelectedAccPaidStatusQ } from '@/lib/hooks/queries/useSelectedAccPaidStatus.query';
import { useUserQ as _useUserQ } from '@/lib/hooks/queries/useUser.query';
import { useGlobalStore } from '@/lib/state-management/useGlobalStore';
import { useRecommendationsStore } from '@/lib/state-management/useRecommendationsStore';
import DashboardSetupComponent from '../dashboard/dashboard-setup/dashboard-setup.component';
import { AccessDenied } from '../ui/access-denied.component';
import GridLoadingComponent from '../ui/grid/grid-loading.component';
import { useRecommendationsQuery as _useRecommendationsQuery } from './queries/useRecommendations.query';
import { useHydrationStore } from '@/lib/state-management/use-hydration-store.helper';
import { AmazonAccount } from '@/types/user/user-amazon-account.type';
import { FEATURE_FLAGS } from '@/lib/feature-flags/feature-flags.constants';
import { RecommendationsFilter } from './components/filter/recommendations-filter.component';

import FbaMisplacedDamagedInventoryItem from './usecase/fba-misplaced-damaged-inventory/fba-misplaced-damage-inventory.item';
import { RecommendationItemWrapper } from './recommendations-item-wrapper';

import FbaMissingInboundItem from './usecase/fba-missing-inbound/fba-missing-inbound.item';
import SizeChangeHigherFbaItem from './usecase/size-change-higher-fba/size-change-higher-fba.item';
import ProductsBundlesItem from './usecase/products-bundles/products-bundles.item';
import QuantityBundlesItem from './usecase/quantity-bundle/quantity-bundle.item';
import { BundleSkuDialogProvider } from './providers/bundle-sku-dialog-provider.component';
import InboundLabelsLowFbaStockItem from './usecase/inbound-labels-low-fba-stock/inbound-labels-low-fba-stock.item';
import { ProductFeedbacksItem } from './usecase/product-feedbacks/product-feedbacks.item';

type Props = {
  account: string;
  useAmazonAccountsQ?: typeof _useAmazonAccountsQ;
  useUserQ?: typeof _useUserQ;
  useRecommendationsQuery?: typeof _useRecommendationsQuery;
  useSelectedAccPaidStatusQ?: typeof _useSelectedAccPaidStatusQ;
  useFlag?: typeof _useFlag;
};

const Recommendations: React.FC<Props> = ({
  useAmazonAccountsQ = _useAmazonAccountsQ,
  useUserQ = _useUserQ,
  useRecommendationsQuery = _useRecommendationsQuery,
  useSelectedAccPaidStatusQ = _useSelectedAccPaidStatusQ,
  account
}) => {
  const selectedAmazonAccount = useHydrationStore(
    useGlobalStore,
    (state) => state.selectedAmazonAccount
  ) as AmazonAccount;
  const selectedAmazonAccountId = selectedAmazonAccount?._id || account;

  const { isLoading: isLoadingUser, data: user } = formatReactQuery(useUserQ);

  const paidStatus = formatReactQuery(useSelectedAccPaidStatusQ, selectedAmazonAccountId);
  const isSelectedAmazonAccountIdPaid = paidStatus?.data?.isSelectedAccPaid || false;
  const { isLoading: isLoadingAmazonAccounts, data: amazonAccounts } =
    formatReactQuery(useAmazonAccountsQ);

  const activeAmazonAccountId = selectedAmazonAccountId;
  const activeAmazonAccount = selectedAmazonAccount;
  const [currentFilter, setCurrentFilter] = useState('all');
  const {
    isLoading: isLoadingRecommendations,
    data: recommendations,
    fetchStatus: fetchStatusRecommendations
  } = formatReactQuery(useRecommendationsQuery, {
    isPaidUser: isSelectedAmazonAccountIdPaid,
    activeAmazonAccountId: activeAmazonAccountId,
    filter: currentFilter
  });

  const setAutomatedUseCases = useRecommendationsStore((state) => state.setAutomatedUseCases);
  const numberOfVisibleRecommendations = useRecommendationsStore(
    (state) => state.numberOfVisibleRecommendations
  );

  const isProductFeedbacksEnabled = useFlag(FEATURE_FLAGS.PRODUCT_FEEDBACKS);
  const isFilterEnabled = true;
  useEffect(() => {
    let automatedUseCases: string[] = [];
    if (recommendations)
      Object.keys(recommendations).forEach((key) => {
        if (recommendations[key].automated) {
          automatedUseCases = [...automatedUseCases, key];
        }
        setAutomatedUseCases(automatedUseCases);
      });
  }, [recommendations, setAutomatedUseCases]);

  const isLoadingAny =
    (isLoadingRecommendations && fetchStatusRecommendations !== 'idle') ||
    isLoadingUser ||
    isLoadingAmazonAccounts;
  const active_account = ['finished', 'new', 'renew', 'in_progress'].includes(
    selectedAmazonAccount?.status
  );

  const has_finished_account =
    selectedAmazonAccount?.status === 'finished' &&
    selectedAmazonAccount?.synch_dashboard?.status === 'finished';

  const isOwnAmazonAccount = typeof selectedAmazonAccount?.permission === 'undefined';

  if (!user || !has_finished_account) {
    return null;
  }
  if (!active_account && amazonAccounts && user && isOwnAmazonAccount) {
    return (
      <Container
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '80vh'
        }}
      >
        <DashboardSetupComponent />
      </Container>
    );
  }
  if (!isLoadingAmazonAccounts && recommendations && Object.keys(recommendations).length === 0) {
    return <AccessDenied />;
  }

  const getIsAutomated = (usecase: string) => {
    return recommendations?.[usecase]?.automated;
  };

  return has_finished_account ? (
    // && isOwnAmazonAccount
    <Box data-cy='recommendations-component'>
      {isFilterEnabled ? (
        <RecommendationsFilter currentFilter={currentFilter} setCurrentFilter={setCurrentFilter} />
      ) : null}
      {isLoadingAny && !recommendations ? <GridLoadingComponent /> : null}

      {recommendations?.fba_misplaced_damaged_inventory ? (
        <RecommendationItemWrapper
          usecaseName={'fba_misplaced_damaged_inventory'}
          usecaseData={recommendations?.fba_misplaced_damaged_inventory}
        >
          {recommendations?.fba_misplaced_damaged_inventory?.data?.map((data, index) =>
            index < numberOfVisibleRecommendations?.['fba_misplaced_damaged_inventory'] ? (
              <FbaMisplacedDamagedInventoryItem
                productData={data}
                key={data.fnsku}
                amazonAccount={activeAmazonAccount}
                isAutomated={getIsAutomated('fba_misplaced_damaged_inventory')}
              />
            ) : null
          )}
        </RecommendationItemWrapper>
      ) : null}

      {recommendations?.fba_missing_inbound ? (
        <RecommendationItemWrapper
          usecaseName={'fba_missing_inbound'}
          usecaseData={recommendations?.fba_missing_inbound}
        >
          {recommendations?.fba_missing_inbound?.data?.map((data, index) =>
            index < numberOfVisibleRecommendations?.['fba_missing_inbound'] ? (
              <FbaMissingInboundItem
                productData={data}
                key={data.fnsku}
                amazonAccount={activeAmazonAccount}
                isAutomated={getIsAutomated('fba_missing_inbound')}
              />
            ) : null
          )}
        </RecommendationItemWrapper>
      ) : null}

      {recommendations?.size_change_higher_fba ? (
        <RecommendationItemWrapper
          usecaseName={'size_change_higher_fba'}
          usecaseData={recommendations?.size_change_higher_fba}
        >
          {recommendations?.size_change_higher_fba?.data?.map((data, index) =>
            index < numberOfVisibleRecommendations?.['size_change_higher_fba'] ? (
              <SizeChangeHigherFbaItem
                productData={data}
                key={data.fnsku}
                amazonAccount={activeAmazonAccount}
                isAutomated={getIsAutomated('size_change_higher_fba')}
              />
            ) : null
          )}
        </RecommendationItemWrapper>
      ) : null}

      {recommendations?.products_bundles ? (
        <RecommendationItemWrapper
          usecaseName={'products_bundles'}
          usecaseData={recommendations?.products_bundles}
        >
          {recommendations?.products_bundles?.data?.map((data, index) =>
            index < numberOfVisibleRecommendations?.['products_bundles'] ? (
              <BundleSkuDialogProvider key={data.cta_id}>
                <ProductsBundlesItem
                  productData={data}
                  key={data.fnsku}
                  amazonAccount={activeAmazonAccount}
                  isAutomated={getIsAutomated('products_bundles')}
                />
              </BundleSkuDialogProvider>
            ) : null
          )}
        </RecommendationItemWrapper>
      ) : null}

      {recommendations?.quantity_bundles ? (
        <RecommendationItemWrapper
          usecaseName={'quantity_bundles'}
          usecaseData={recommendations?.quantity_bundles}
        >
          {recommendations?.quantity_bundles?.data?.map((data, index) =>
            index < numberOfVisibleRecommendations?.['quantity_bundles'] ? (
              <BundleSkuDialogProvider key={data.cta_id}>
                <QuantityBundlesItem
                  productData={data}
                  key={data.fnsku}
                  amazonAccount={activeAmazonAccount}
                  isAutomated={getIsAutomated('quantity_bundles')}
                />
              </BundleSkuDialogProvider>
            ) : null
          )}
        </RecommendationItemWrapper>
      ) : null}

      {recommendations?.inbound_labels_low_fba_stock ? (
        <RecommendationItemWrapper
          usecaseName={'inbound_labels_low_fba_stock'}
          usecaseData={recommendations?.inbound_labels_low_fba_stock}
        >
          {recommendations?.inbound_labels_low_fba_stock?.data?.map((data, index) =>
            index < numberOfVisibleRecommendations?.['inbound_labels_low_fba_stock'] ? (
              <BundleSkuDialogProvider key={data.cta_id}>
                <InboundLabelsLowFbaStockItem
                  productData={data}
                  key={data.fnsku}
                  amazonAccount={activeAmazonAccount}
                  isAutomated={getIsAutomated('inbound_labels_low_fba_stock')}
                  user={user}
                />
              </BundleSkuDialogProvider>
            ) : null
          )}
        </RecommendationItemWrapper>
      ) : null}

      {isProductFeedbacksEnabled && recommendations?.product_feedbacks ? (
        <RecommendationItemWrapper
          usecaseName={'product_feedbacks'}
          usecaseData={recommendations?.product_feedbacks}
        >
          {recommendations?.product_feedbacks?.data?.map((data, index) =>
            index < numberOfVisibleRecommendations?.['product_feedbacks'] ? (
              <BundleSkuDialogProvider key={data.cta_id}>
                <ProductFeedbacksItem
                  productData={data}
                  key={data.fnsku}
                  amazonAccount={activeAmazonAccount}
                  isAutomated={getIsAutomated('product_feedbacks')}
                  user={user}
                />
              </BundleSkuDialogProvider>
            ) : null
          )}
        </RecommendationItemWrapper>
      ) : null}
    </Box>
  ) : null;
};

export default Recommendations;
