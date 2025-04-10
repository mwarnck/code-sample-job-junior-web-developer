import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Chip, Grid, Typography } from '@mui/material';

import { useTranslation } from 'next-i18next';
import 'tippy.js/dist/tippy.css';
import { useIsAutomationAccount as _useIsAutomationAccount } from '../../helpers/useIsAutomationAccount';

import { StickyAccordionSummary } from '../../recommendations.style';

import { RecommendationSavings } from '@/types/recommendations/recommendation.type';
import { KpiBlockComponent } from './kpi-block.component';
import { formatReactQuery } from '@/lib/helpers/utils/formatReactQuery';
import { useHydrationStore } from '@/lib/state-management/use-hydration-store.helper';
import { useGlobalStore } from '@/lib/state-management/useGlobalStore';
import { useSelectedAccPaidStatusQ as _useSelectedAccPaidStatusQ } from '@/lib/hooks/queries/useSelectedAccPaidStatus.query';
import { RecommendationProgress } from '../progress/recommendation-progress.component';
import { AutomationIcon } from './recommendations.automation-icon.component';

type RecommendationHeaderProps = {
  savings?: RecommendationSavings;
  usecase: unknown;
  numberOfRecommendations: {
    completed: number;
    total: number;
  };
  isAutomated: boolean;
  isBeta?: boolean;
  useIsAutomationAccount?: typeof _useIsAutomationAccount;
  useSelectedAccPaidStatusQ?: typeof _useSelectedAccPaidStatusQ;
};

export const RecommendationsHeader: React.FC<RecommendationHeaderProps> = ({
  savings,
  usecase,
  numberOfRecommendations,
  isAutomated,
  isBeta = false,
  useIsAutomationAccount = _useIsAutomationAccount,
  useSelectedAccPaidStatusQ = _useSelectedAccPaidStatusQ
}) => {
  const { t } = useTranslation(['recommendations', 'common']);
  const isAutomationAccount = formatReactQuery(useIsAutomationAccount);
  const selectedAmazonAccount = useHydrationStore(
    useGlobalStore,
    (state) => state.selectedAmazonAccount
  );
  const { data } = useSelectedAccPaidStatusQ(selectedAmazonAccount?._id || '');
  const isSelectedAccountPaid = data?.isSelectedAccPaid;

  return (
    <StickyAccordionSummary
      data-cy='recommendations-headline'
      expandIcon={<ExpandMoreIcon sx={{ marginRight: 2, marginLeft: 2 }} />}
      disabled={!isSelectedAccountPaid}
    >
      <Grid container direction={'row'}>
        <Grid item sm={6} xs={12} md={6} alignSelf={'center'}>
          <Typography variant='body1' sx={{ fontWeight: 'bold' }}>
            {t(`recommendations:recommendations.usecase_headlines.${usecase}`, {
              defaultValue: ''
            })}{' '}
            {isBeta ? <Chip label='Beta' color='info' sx={{ mb: 0.5 }} size='small' /> : null}
            {isAutomated ? (
              <AutomationIcon tooltip={t('recommendations:recommendations.fully_automated')} />
            ) : null}
          </Typography>

          {numberOfRecommendations?.total && !isAutomationAccount ? (
            <RecommendationProgress
              usecase={usecase}
              total={numberOfRecommendations?.total}
              completed={numberOfRecommendations?.completed}
            />
          ) : null}
        </Grid>
        {numberOfRecommendations?.total && savings && !isAutomationAccount ? (
          <KpiBlockComponent usecase={usecase} savings={savings} />
        ) : null}
      </Grid>
    </StickyAccordionSummary>
  );
};
