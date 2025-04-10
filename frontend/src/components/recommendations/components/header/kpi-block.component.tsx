import { Box, Grid, Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { formatFloat } from '../../../dashboard/helpers/format-float.helper';
import { RecommendationSavings } from '@/types/recommendations/recommendation.type';

type KpiBlockComponentProps = {
  savings: RecommendationSavings | null;
  usecase: unknown;
};

export const KpiBlockComponent: React.FC<KpiBlockComponentProps> = ({ usecase, savings }) => {
  const { t } = useTranslation(['recommendations', 'common']);

  return (
    <Grid container item sm={6} xs={12} md={6} justifyContent={'flex-start'} alignItems={'center'}>
      {
        <Box sx={{ minWidth: 200 }}>
          <Typography variant='body2'>
            {t(`recommendations:recommendations.${usecase}.headline-realized-savings`, {
              defaultValue: ''
            })}
          </Typography>
          <Typography
            variant='h5'
            data-cy='recommendations-header-realized-savings'
            color={'success.dark'}
          >
            {t(`recommendations:recommendations.${usecase}.headline-realized-savings-sum`, {
              savings: formatFloat({
                amount: savings?.realized,
                decimal: t('general.decimalPoint', { ns: 'common' }),
                thousands: t('general.thousandPoint', { ns: 'common' })
              }),
              currency: t(`common:general.currency.${savings?.currency}`, {
                defaultValue: ''
              }),
              defaultValue: ''
            })}
          </Typography>
        </Box>
      }
      <Box sx={{ minWidth: 200 }}>
        <Typography variant='body2'>
          {t(`recommendations:recommendations.${usecase}.headline-savings`, {
            defaultValue: ''
          })}
        </Typography>
        <Typography variant='h5' data-cy='recommendations-header-savings' color={'primary.main'}>
          {t(`recommendations:recommendations.${usecase}.headline-savings-sum`, {
            savings: formatFloat({
              amount: savings?.potential,
              decimal: t('general.decimalPoint', { ns: 'common' }),
              thousands: t('general.thousandPoint', { ns: 'common' })
            }),
            currency: t(`common:general.currency.${savings?.currency}`, {
              defaultValue: ''
            }),
            defaultValue: ''
          })}
        </Typography>
      </Box>
    </Grid>
  );
};
