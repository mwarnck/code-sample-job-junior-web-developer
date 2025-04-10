import { Box, Typography } from '@mui/material';
import { getStatusIcon } from '../../helpers/recommendations.helpers.utils';
import { useTranslation } from 'next-i18next';

interface RecommendationStatusProps {
  status: string;
  usecase: string;
}

export const RecommendationStatus: React.FC<RecommendationStatusProps> = ({ status, usecase }) => {
  const { t } = useTranslation(['recommendations']);
  return (
    <Box
      sx={{
        border: (theme) => `1px solid ${theme.palette.grey[400]}`,
        px: 1,
        py: 0.5,
        borderRadius: 1
      }}
    >
      <Box sx={{ display: 'flex' }}>
        <Typography variant='body2' fontWeight={'bold'}>
          {t('recommendations:recommendations.status-label')}
        </Typography>
        {getStatusIcon(status, { padding: 0.25 })}
      </Box>
      <Typography
        variant='body2'
        sx={{ margin: '0 !important' }}
        data-cy='recommendation-status-automated'
      >
        {status === 'empty'
          ? t('recommendations:recommendations.status.empty-automated')
          : t(`recommendations:recommendations.${usecase}.status-${status}`, {
              defaultValue: ''
            })}
      </Typography>
    </Box>
  );
};
