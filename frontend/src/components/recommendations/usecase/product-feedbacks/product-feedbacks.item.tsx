import { User } from '@/types/user/user';
import { AmazonAccount } from '@/types/user/user-amazon-account.type';
import { Alert, Grid, List, ListItem, ListSubheader, Stack, Typography } from '@mui/material';
import { ProductFeedbacksRecommendation } from '@/types/recommendations/recommendation.type';
import Dropdown from '../../components/dropdown/recommendations.dropdown.component';
import ProductInfosGridItem from '../../components/products-info/recommendations.product-infos.component';
import { convertToCta, createDigitNumber } from '../../helpers/recommendations.helpers.utils';
import useIsAutomatedAndNotAutomationAcc from '../../helpers/useIsAutomatedAndNotAutomationAcc';
import { useUpdateRecommendationsStatus } from '../../queries/mutations/use-update-recommendations-status.mutation';
import { UseCaseContainer } from '../usecases.style';
import { useTranslation } from 'next-i18next';
import dayjs from 'dayjs';
import { ModalCtaBasic } from '@/components/assistant/components/modal/modal-cta-basic.component';
import { CtaProductFeedbacks } from '@/components/assistant/types/assistant-cta.type';
import { useDeeplTranslation } from '@/lib/hooks/queries/useDeeplTranlation.query';
import GridLoadingComponent from '@/components/ui/grid/grid-loading.component';

interface ProductFeedbacksItemProps {
  productData: ProductFeedbacksRecommendation;
  user: User;
  amazonAccount: AmazonAccount;
  isAutomated: boolean;
}

export const dropdownItems = ['todo', 'done', 'not_interesting'];

export const ProductFeedbacksItem: React.FC<ProductFeedbacksItemProps> = ({
  productData,
  amazonAccount,
  isAutomated,
  user
}) => {
  const updateRecommendationStatusMutation = useUpdateRecommendationsStatus();
  const isAutomatedAndNotAutomationAcc = useIsAutomatedAndNotAutomationAcc(isAutomated);

  const handleChange = (status: string) => {
    updateRecommendationStatusMutation.mutate({
      _id: productData._id,
      status
    });
  };
  const { t } = useTranslation(['recommendations', 'common']);

  const ctaData = convertToCta.classic_cta(productData) as CtaProductFeedbacks;

  const { data: translatedActions, isFetching: isLoadingActions } = useDeeplTranslation({
    untranslated: productData.reason_list
      .map((x) => x.action)
      .filter((x) => typeof x === 'string') as string[],
    userLanguage: user.language,
    queryKeyType: `product-feedbacks-translated-actions-${productData.sku}`
  });

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
            isAutomatedOrNotAutomationAccount={isAutomatedAndNotAutomationAcc}
          />
        </Grid>
      </Grid>
      <Grid item xs={12} sm={4} md={2}>
        <Stack spacing={2}>
          <Dropdown
            handleChange={handleChange}
            recoStatus={productData?.resolved_status || 'empty'}
            values={dropdownItems}
            usecase={productData?.usecase}
            isAutomated={isAutomated}
          />

          {productData?.resolved ||
          isAutomatedAndNotAutomationAcc ||
          productData?.resolved_status ? null : (
            <ModalCtaBasic
              data={ctaData}
              currency={amazonAccount?.currency}
              defaultMarketplace={amazonAccount?.default_marketplace_country}
            />
          )}
        </Stack>
      </Grid>

      <Grid item xs={12} sm={8} md={10}>
        <Alert icon={false} color='info' sx={{ pt: 0, mb: 1 }}>
          <List
            sx={{ listStyleType: 'disc', p: 0 }}
            subheader={
              <ListSubheader
                sx={{
                  color: (theme) => theme.palette.text.primary,
                  height: 32,
                  mb: 1,
                  backgroundColor: 'transparent'
                }}
                disableGutters
              >
                {translatedActions?.length > 1
                  ? t('recommendations.product_feedbacks.recommended-actions')
                  : t('recommendations.product_feedbacks.recommended-action')}
              </ListSubheader>
            }
          >
            {translatedActions && !isLoadingActions ? (
              translatedActions.map((action, idx) => (
                <ListItem
                  key={action.translated}
                  sx={{ display: 'flex', gap: 1, alignItems: 'start' }}
                  disablePadding
                >
                  {translatedActions?.length > 1 ? (
                    <Typography variant='body2'>{idx + 1}.</Typography>
                  ) : null}
                  <Typography variant='body2'>{action.translated}</Typography>
                </ListItem>
              ))
            ) : (
              <GridLoadingComponent />
            )}
          </List>
        </Alert>
      </Grid>

      <Grid item xs={12} sm={8} md={10}>
        <Grid container gap={1}>
          <Grid item>
            <Typography variant='body2' fontWeight={'bold'}>
              {t('recommendations.product_feedbacks.period-of-returns')}
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant='body2'>
              {dayjs(productData?.return_period_start).format(t('common:general.date.long'))} -{' '}
              {dayjs(productData?.return_period_end).format(t('common:general.date.long'))}
            </Typography>
          </Grid>
        </Grid>
        <Grid container gap={1}>
          <Grid item>
            <Typography variant='body2' fontWeight={'bold'}>
              {t('recommendations.product_feedbacks.return-rate')}
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant='body2'>
              {createDigitNumber(productData?.returns_percentage)} %
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </UseCaseContainer>
  );
};
