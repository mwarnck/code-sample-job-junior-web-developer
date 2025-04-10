import { useState } from 'react';
import { AccordionDetails, Button, Grid } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { betaUsecases, recommendationsConfig } from './recommendations.config';
import { useIsAutomationAccount } from './helpers/useIsAutomationAccount';
import { StyledAccordion } from './recommendations.style';
import { RecommendationsHeader } from './components/header/recommendations.header.component';
import Instructions from './components/instructions/recommendations.instructions.component';
import { useRecommendationsStore } from '@/lib/state-management/useRecommendationsStore';
import { UsecaseData } from '@/types/recommendations/recommendation.type';

interface FbaMisplacedDamagedInventoryProps {
  usecaseName: string;
  usecaseData: UsecaseData;
  children?: React.ReactNode;
}

export const RecommendationItemWrapper: React.FC<FbaMisplacedDamagedInventoryProps> = ({
  usecaseName,
  usecaseData,
  children
}) => {
  const { t } = useTranslation(['recommendations', 'common']);

  const isAutomationAccount = useIsAutomationAccount();
  const [isExpanded, setIsExpanded] = useState(isAutomationAccount);

  const setNumberOfVisibleRecommendations = useRecommendationsStore(
    (state) => state.setNumberOfVisibleRecommendations
  );
  const numberOfVisibleRecommendations = useRecommendationsStore(
    (state) => state.numberOfVisibleRecommendations
  );

  const handleOpenClose = () => (_: React.SyntheticEvent, newExpanded: boolean) => {
    newExpanded &&
      setNumberOfVisibleRecommendations(
        usecaseName,
        recommendationsConfig.items.initial_item_number
      );
    setIsExpanded(!isExpanded);
  };

  return (
    <StyledAccordion
      slotProps={{ transition: { unmountOnExit: true } }}
      onChange={handleOpenClose()}
      expanded={isExpanded}
    >
      <RecommendationsHeader
        savings={usecaseData?.savings}
        usecase={usecaseName}
        numberOfRecommendations={usecaseData?.number_of_recommendations}
        isAutomated={usecaseData?.automated}
        isBeta={betaUsecases.includes(usecaseName)}
      />
      <AccordionDetails>
        <Instructions usecase={usecaseName} />
        <Grid container direction={'row'} gap={2} mt={2}>
          {children}
          {usecaseData?.data?.length > numberOfVisibleRecommendations[usecaseName] ? (
            <Grid item>
              <Button
                variant='outlined'
                size='small'
                onClick={() =>
                  setNumberOfVisibleRecommendations(
                    usecaseName,
                    numberOfVisibleRecommendations[usecaseName] +
                      recommendationsConfig.items.load_more_value
                  )
                }
              >
                {t('recommendations:recommendations.load-more')}
              </Button>
            </Grid>
          ) : null}
        </Grid>
      </AccordionDetails>
    </StyledAccordion>
  );
};
