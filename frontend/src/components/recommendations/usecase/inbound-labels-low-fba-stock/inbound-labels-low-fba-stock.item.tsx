import { User } from '@/types/user/user';
import { AmazonAccount } from '@/types/user/user-amazon-account.type';
import { Grid, Stack } from '@mui/material';
import { useTranslation } from 'next-i18next';
import dayjs from 'dayjs';
import { ModalCtaBasic } from '@/components/assistant/components/modal/modal-cta-basic.component';
import { CtaInboundLabelsLowFbaStock } from '@/components/assistant/types/assistant-cta.type';
import { InboundLabelsLowFbaStockRecommendation } from '@/types/recommendations/recommendation.type';

import UsecaseDetails from '../../components/details/recommendations.usecase-details.component';
import Dropdown from '../../components/dropdown/recommendations.dropdown.component';
import ProductInfosGridItem from '../../components/products-info/recommendations.product-infos.component';
import { convertToCta } from '../../helpers/recommendations.helpers.utils';
import useIsAutomatedAndNotAutomationAcc from '../../helpers/useIsAutomatedAndNotAutomationAcc';
import { useUpdateRecommendationsStatus } from '../../queries/mutations/use-update-recommendations-status.mutation';
import { UseCaseContainer } from '../usecases.style';

interface InboundLabelsLowFbaStockItemProps {
  productData: InboundLabelsLowFbaStockRecommendation;
  amazonAccount: AmazonAccount;
  user: User;
  isAutomated: boolean;
}

// Ware ans Amazon Lager schicken
const InboundLabelsLowFbaStockItem: React.FC<InboundLabelsLowFbaStockItemProps> = ({
  productData,
  amazonAccount,
  user,
  isAutomated
}) => {
  const { t } = useTranslation(['recommendations', 'common']);

  const dropdownValues = [
    'accepted',
    'already_done',
    'sold_out',
    'discontinued',
    'not_interesting'
  ];

  const updateRecommendationStatusMutation = useUpdateRecommendationsStatus();
  const isAutomatedAndNotAutomationAcc = useIsAutomatedAndNotAutomationAcc(isAutomated);

  const handleChange = (status: string) => {
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
            asin={productData?.asin}
            sku={productData?.sku}
            fnsku={null}
          />

          <UsecaseDetails
            detailsLength={6}
            usecase={productData?.usecase}
            details={[
              {
                name: 'stock',
                value: productData?.fba_stock
              },
              {
                name: 'total-available',
                value: productData?.available_units
              },
              {
                name: 'units-in-shipment',
                value: productData?.open_quantity
              },
              {
                name: 'units-to-ship',
                value: productData?.recommended_units_to_ship
              },
              {
                name: 'marketplace-destination',
                value: t(`common:general.countries.${productData?.country_code}`, {
                  defaultValue: ''
                })
              },
              {
                name: 'inventory-date',
                value: dayjs(productData?.inventory_date).format(
                  user.language === 'de' ? 'DD.MM.YYYY' : 'YYYY-MM-DD'
                )
              }
            ]}
          />
        </Grid>
      </Grid>
      <Grid item xs={12} sm={4} md={2}>
        <Stack spacing={2}>
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
              data={convertToCta.classic_cta(productData) as CtaInboundLabelsLowFbaStock}
              currency={amazonAccount?.currency}
              defaultMarketplace={amazonAccount?.default_marketplace_country}
            />
          )}
        </Stack>
      </Grid>
    </UseCaseContainer>
  );
};

export default InboundLabelsLowFbaStockItem;
