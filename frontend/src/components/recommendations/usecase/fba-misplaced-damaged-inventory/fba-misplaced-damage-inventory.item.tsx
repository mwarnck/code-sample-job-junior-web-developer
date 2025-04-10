import { AmazonAccount } from '@/types/user/user-amazon-account.type';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Grid, Stack, Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';

import { ModalCtaBasic } from '@/components/assistant/components/modal/modal-cta-basic.component';
import { CtaDamagedAndMisplacedInventory } from '@/components/assistant/types/assistant-cta.type';
import { FbaMisplacedDamagedInventoryRecommendation } from '@/types/recommendations/recommendation.type';

import UsecaseDetails from '../../components/details/recommendations.usecase-details.component';
import Dropdown from '../../components/dropdown/recommendations.dropdown.component';
import MessageModal from '../../components/messages/recommendations.message-dialog.component';
import ProductInfosGridItem from '../../components/products-info/recommendations.product-infos.component';
import { convertToCta, createDigitNumber } from '../../helpers/recommendations.helpers.utils';
import useIsAutomatedAndNotAutomationAcc from '../../helpers/useIsAutomatedAndNotAutomationAcc';
import { useUpdateRecommendationsStatus } from '../../queries/mutations/use-update-recommendations-status.mutation';
// import { recommendationsConfig } from '../../recommendations.config';
import { UseCaseContainer } from '../usecases.style';
import { MIXPANEL_EVENTS } from '@/lib/mixpanel/mixpanel-events.constants';
import { MixpanelWrapper } from '@/lib/mixpanel/useMixpanel';
import { useIsAutomationAccount } from '../../helpers/useIsAutomationAccount';

interface ProductProps {
  productData: FbaMisplacedDamagedInventoryRecommendation;
  amazonAccount: AmazonAccount;
  isAutomated: boolean;
  resolvedBy?: string;
  isOnboarding?: boolean;
}

// Verlorener / beschädigter Lagerbestand
const FbaMisplacedDamagedInventoryItem: React.FC<ProductProps> = ({
  productData,
  amazonAccount,
  isAutomated,
  resolvedBy,
  isOnboarding = false
}) => {
  const { t } = useTranslation(['recommendations', 'common']);

  const dropdownValues = ['done', 'not_interesting'];
  const updateRecommendationStatusMutation = useUpdateRecommendationsStatus();

  const isAutomatedAndNotAutomationAcc = useIsAutomatedAndNotAutomationAcc(isAutomated);

  const isAutomationAcc = useIsAutomationAccount();
  const isLastMessageFromAutomation = productData?.is_last_message_from_automation ?? false;
  const handleChange = (status: string) => {
    MixpanelWrapper.track(MIXPANEL_EVENTS.RECOMMENDATIONS.FBA_MISPLACED_DAMAGED_INVENTORY.UPDATED, {
      status,
      recommendation_id: productData._id,
      resolver: resolvedBy
    });

    updateRecommendationStatusMutation.mutate({
      _id: productData._id,
      status,
      resolver: resolvedBy
    });
  };
  return (
    <UseCaseContainer container>
      <Grid item xs={12} sm={8} md={10}>
        <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
          <ProductInfosGridItem
            image={productData?.image}
            name={productData?.name}
            asin={productData?.asin}
            sku={productData?.sku}
            fnsku={productData?.fnsku}
            isAutomatedOrNotAutomationAccount={isAutomationAcc || isAutomatedAndNotAutomationAcc}
          />
          <UsecaseDetails
            // based of total items
            detailsLength={7}
            usecase='fba_misplaced_damaged_inventory'
            details={[
              {
                name: 'refund-reimbursed',
                value: createDigitNumber(productData?.refunds?.reimbursed, productData?.currency),
                customValueStyle: {
                  color: 'success.dark'
                }
              },
              {
                name: 'refund-possible',
                value:
                  productData?.refunds?.possible === 0 &&
                  (productData?.items?.unreconciled > 0 || productData?.items?.open > 0)
                    ? '?'
                    : createDigitNumber(productData?.refunds?.possible, productData?.currency),
                containerToolTip:
                  productData?.refunds?.possible === 0 &&
                  (productData?.items?.unreconciled > 0 || productData?.items?.open > 0)
                    ? 'refund-not-calculable'
                    : null
              },
              {
                name: 'items-reimbursed',
                value: productData?.items?.reimbursed || 0,
                customValueStyle: {
                  color: 'success.dark'
                }
              },

              {
                name: 'items-stock-found',
                value: productData?.items?.stock_found || 0,
                customValueStyle: {
                  color: 'success.dark'
                }
              },
              {
                name: 'items-rejected',
                value: productData?.items?.rejected || 0
              },
              {
                name: 'items-open',
                value: productData?.items?.open || 0
              },
              {
                name: 'items-unreconciled',
                value: productData?.items?.unreconciled
              }
            ]}
          />
        </Grid>
      </Grid>
      <Grid item xs={12} sm={4} md={2}>
        <Stack spacing={2}>
          {productData?.resolved ? (
            <Stack direction='row'>
              <CheckCircleIcon
                sx={{
                  color: 'success.main',
                  width: '24px',
                  height: '24px',
                  mr: 1
                }}
              />
              {productData?.items?.open ? (
                <Typography variant='body2'>
                  {t('recommendations:recommendations.fba_misplaced_damaged_inventory.all-done')}
                </Typography>
              ) : (
                <Typography variant='body2'>
                  {t('recommendations:recommendations.fba_misplaced_damaged_inventory.completed')}
                </Typography>
              )}
            </Stack>
          ) : isOnboarding ? null : (
            <Dropdown
              handleChange={handleChange}
              recoStatus={productData?.resolved_status || 'empty'}
              values={dropdownValues}
              usecase='fba_misplaced_damaged_inventory'
              isAutomated={isAutomated}
            />
          )}

          {isAutomationAcc ? (
            <MessageModal
              messages={productData?.messages}
              recommendationId={productData?._id}
              isLastMessageFromAutomation={isLastMessageFromAutomation}
            />
          ) : null}

          {isAutomatedAndNotAutomationAcc &&
          productData?.messages?.length &&
          isLastMessageFromAutomation ? (
            <ModalCtaBasic
              data={
                convertToCta.automation_message_cta(productData) as CtaDamagedAndMisplacedInventory
              }
              displayMode='stepper'
              currency={amazonAccount?.currency}
              defaultMarketplace={amazonAccount?.default_marketplace_country}
              modalButtonText='show-message'
            />
          ) : null}

          {productData?.resolved || isAutomatedAndNotAutomationAcc ? null : (
            <ModalCtaBasic
              data={convertToCta.classic_cta(productData) as CtaDamagedAndMisplacedInventory}
              displayMode='stepper'
              currency={amazonAccount?.currency}
              defaultMarketplace={amazonAccount?.default_marketplace_country}
            />
          )}
        </Stack>
      </Grid>
    </UseCaseContainer>
  );
};

export default FbaMisplacedDamagedInventoryItem;
