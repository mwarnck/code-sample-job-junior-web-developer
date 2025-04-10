import DoNotDisturbAltIcon from '@mui/icons-material/DoNotDisturbAlt';
import { Grid, Stack, Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';
import 'tippy.js/dist/tippy.css';

import ImageComponent from '../../../image/image.component';

interface ProductInfosGridItemProps {
  image: string | null;
  name: string | null;
  asin: string | null;
  sku: string | null;
  fnsku: string | null;
  isAutomatedOrNotAutomationAccount?: boolean;
}

const ProductInfosGridItem: React.FC<ProductInfosGridItemProps> = ({
  image,
  asin,
  sku,
  fnsku,
  name
}) => {
  const { t } = useTranslation(['recommendations', 'common']);

  return (
    <>
      <Grid item md={1} xs={2}>
        {image ? (
          <ImageComponent
            src={image}
            alt='product'
            width={64}
            height={64}
            data-cy='recommendations-infos-image'
          />
        ) : (
          <DoNotDisturbAltIcon
            data-cy='recommendations-infos-no-image'
            sx={{ width: '64px', height: '64px' }}
          />
        )}
      </Grid>
      <Grid item xs={10} md={11}>
        <Typography
          variant='body1'
          data-cy='recommendations-infos-name'
          sx={{ fontWeight: 'bolder' }}
        >
          {name}
        </Typography>
        <Stack spacing={2} direction={'row'}>
          {sku ? (
            <Typography variant='body2' data-cy='recommendations-infos-sku-fnsku'>
              <b>{t(`recommendations:recommendations.sku`)}</b> {sku}
            </Typography>
          ) : null}
          {fnsku ? (
            <Typography variant='body2' data-cy='recommendations-infos-sku-fnsku'>
              <b>{t(`recommendations:recommendations.fnsku`)}</b> {fnsku}
            </Typography>
          ) : null}
          <Typography variant='body2' data-cy='recommendations-infos-asin'>
            <b>{t('recommendations:recommendations.asin')}</b>{' '}
            {asin || t('recommendations:recommendations.not-available')}
          </Typography>
        </Stack>
      </Grid>
    </>
  );
};
export default ProductInfosGridItem;
