import { Grid, Typography } from '@mui/material';
import { LinearProgressWithLabel } from './recommendation-liniear-progress.component';
import { useTranslation } from 'next-i18next';

interface RecommendationProgressProps {
  usecase: unknown;
  total: number;
  completed: number;
}

export const RecommendationProgress: React.FC<RecommendationProgressProps> = ({
  usecase,
  total,
  completed
}) => {
  const { t } = useTranslation(['recommendations', 'common']);

  return (
    <Grid item xs={12} sm={7} data-cy='recommendations-header-progress-block'>
      <Typography variant='body2' data-cy='recommendations-header-completed'>
        {t(`recommendations:recommendations.${usecase}.headline-completed`, {
          totalRecommendations: total,
          completedRecommendations: completed,
          defaultValue: ''
        })}
      </Typography>
      <LinearProgressWithLabel variant='determinate' value={(100 / total) * completed} />
    </Grid>
  );
};
