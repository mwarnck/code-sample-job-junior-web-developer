import { AmazonAccount } from '@/types/user/user-amazon-account.type';
import { Grid, Stack } from '@mui/material';

import { ModalCtaBasic } from '@/components/assistant/components/modal/modal-cta-basic.component';
import { CtaQuantityBundles } from '@/components/assistant/types/assistant-cta.type';
import { QuantityBundleRecommendation } from '@/types/recommendations/recommendation.type';

import UsecaseDetails from '../../components/details/recommendations.usecase-details.component';
import Dropdown from '../../components/dropdown/recommendations.dropdown.component';
import ProductInfosGridItem from '../../components/products-info/recommendations.product-infos.component';
import { convertToCta, createDigitNumber } from '../../helpers/recommendations.helpers.utils';
import useIsAutomatedAndNotAutomationAcc from '../../helpers/useIsAutomatedAndNotAutomationAcc';
import { useUpdateRecommendationsStatus } from '../../queries/mutations/use-update-recommendations-status.mutation';
import useRecommendationsWriteAccess from '../../helpers/useRecommendationsWriteAccess';
import { UseCaseContainer } from '../usecases.style';
import { BundleSkuComponent } from '../../components/bundle-sku-dialog/bundle-sku.component';
import { useBundleSkuDialog } from '../../providers/bundle-sku-dialog-provider.component';

interface ProductProps {
  productData: QuantityBundleRecommendation;
  amazonAccount: AmazonAccount;
  isAutomated: boolean;
}

// Stückzahl Bundles
const QuantityBundlesItem: React.FC<ProductProps> = ({
  productData,
  amazonAccount,
  isAutomated
}) => {
  const dropdownValues = ['todo', 'done', 'already_done', 'not_interesting'];
  const { dialogOpen, setDialogOpen } = useBundleSkuDialog();

  const accountHasWriteAccess = useRecommendationsWriteAccess();

  const updateRecommendationStatusMutation = useUpdateRecommendationsStatus();
  const isAutomatedAndNotAutomationAcc = useIsAutomatedAndNotAutomationAcc(isAutomated);

  const handleChange = (status: string) => {
    if (status === 'done') {
      setDialogOpen(true);
    }

    updateRecommendationStatusMutation.mutate({
      _id: productData._id,
      status
    });
  };

  return (
    <UseCaseContainer container>
      <Grid item xs={12} sm={8} md={10}>
        <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
          <ProductInfosGridItem
            image={productData?.image}
            name={productData?.name}
            asin={productData?.products[0]?.asin}
            sku={productData?.products[0]?.sku}
            fnsku={null}
          />
          <UsecaseDetails
            detailsLength={4}
            usecase={productData?.usecase}
            details={[
              ...(['done'].includes(productData?.resolved_status)
                ? [
                    {
                      name: 'realized-savings',
                      value: createDigitNumber(
                        productData?.realized_savings,
                        productData?.currency
                      ),
                      customValueStyle: { color: 'success.dark' }
                    }
                  ]
                : []),
              ...(['done'].includes(productData?.resolved_status)
                ? [
                    {
                      name: 'orders-new-bundle',
                      value: productData?.orders_new_bundle ? productData?.orders_new_bundle : 0,

                      customValueStyle: { color: 'success.dark' }
                    }
                  ]
                : []),
              ...(['done'].includes(productData?.resolved_status)
                ? [
                    {
                      name: 'realized-average-saving-per-order',
                      value: createDigitNumber(
                        productData?.average_saving_per_order,
                        productData?.currency
                      ),
                      customValueStyle: { color: 'success.dark' }
                    }
                  ]
                : []),
              ...(!['done'].includes(productData?.resolved_status)
                ? [
                    {
                      name: 'savings-year',
                      value: createDigitNumber(productData?.costsavings?.min, productData?.currency)
                    }
                  ]
                : []),
              ...(!['done'].includes(productData?.resolved_status)
                ? [
                    {
                      name: 'quantity-orders',
                      value: productData?.orders,
                      nameTranslationProps: {
                        quantity: productData?.quantity
                      }
                    }
                  ]
                : []),
              ...(!['done'].includes(productData?.resolved_status)
                ? [
                    {
                      name: 'savings-order',
                      value: createDigitNumber(
                        productData.costsavings.min / productData.orders,
                        productData?.currency
                      )
                    }
                  ]
                : []),
              {
                name: ['done'].includes(productData?.resolved_status)
                  ? 'quantity-realized'
                  : 'quantity',
                value: productData.quantity
              }
            ]}
          />
        </Grid>
      </Grid>

      <Grid item xs={12} sm={4} md={2}>
        <Stack spacing={2}>
          {!accountHasWriteAccess ? null : (
            <BundleSkuComponent
              dialogOpen={dialogOpen}
              setDialogOpen={setDialogOpen}
              recommendationId={productData._id}
              initialBundleSku={productData.bundle_sku}
              resolved_status={productData?.resolved_status}
            />
          )}
          <Dropdown
            handleChange={handleChange}
            recoStatus={productData?.resolved_status || 'empty'}
            values={dropdownValues}
            usecase={productData?.usecase}
            isAutomated={isAutomated}
          />

          {productData?.resolved ||
          isAutomatedAndNotAutomationAcc ||
          productData?.resolved_status ? null : (
            <ModalCtaBasic
              data={convertToCta.classic_cta(productData) as CtaQuantityBundles}
              currency={amazonAccount?.currency}
              defaultMarketplace=''
            />
          )}
        </Stack>
      </Grid>
    </UseCaseContainer>
  );
};

export default QuantityBundlesItem;
