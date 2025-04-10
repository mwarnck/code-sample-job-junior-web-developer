import { Box, Divider, Tab, Tabs } from '@mui/material';

import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { availableFilters } from '../../recommendations.config';
import { useTranslation } from 'next-i18next';
import { useHydrationStore } from '@/lib/state-management/use-hydration-store.helper';
import { useGlobalStore } from '@/lib/state-management/useGlobalStore';
import { useSelectedAccPaidStatusQ } from '@/lib/hooks/queries/useSelectedAccPaidStatus.query';

interface RecommendationsFilterProps {
  currentFilter: string;
  setCurrentFilter: (newFilter: string) => void;
}

export const RecommendationsFilter: React.FC<RecommendationsFilterProps> = ({
  currentFilter,
  setCurrentFilter
}) => {
  const { t } = useTranslation(['recommendations']);
  const selectedAmazonAccount = useHydrationStore(
    useGlobalStore,
    (state) => state.selectedAmazonAccount
  );
  const { data } = useSelectedAccPaidStatusQ(selectedAmazonAccount?._id || '');
  const isSelectedAccountPaid = data?.isSelectedAccPaid;

  const handleChange = (_event, newValue) => {
    setCurrentFilter(newValue);
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          backgroundColor: 'background.paper',
          padding: 0.5,
          borderRadius: 1,
          boxShadow: (theme) => theme.shadows[4],
          mb: 2,
          p: 1,
          opacity: isSelectedAccountPaid ? 1 : 0.5
        }}
      >
        <Box sx={{ alignSelf: 'center' }}>
          <FilterAltIcon
            sx={{ color: (theme) => theme.palette.primary.main, width: 32, height: 32, mx: 1 }}
          />
        </Box>

        <>
          <Divider
            flexItem
            orientation='vertical'
            sx={{ backgroundColor: 'grey.400', mx: 1, p: 0 }}
          />
          <Tabs
            value={currentFilter}
            onChange={handleChange}
            variant='scrollable'
            scrollButtons='auto'
            // sx={{ minHeight: 24 }}
          >
            {availableFilters.map((filter) => (
              <Tab
                key={filter}
                label={t(`recommendations:recommendations.filters.${filter}`, {
                  defaultValue: ''
                })}
                value={filter}
                disabled={!isSelectedAccountPaid}
              />
            ))}
          </Tabs>
        </>
      </Box>
    </>
  );
};
//
