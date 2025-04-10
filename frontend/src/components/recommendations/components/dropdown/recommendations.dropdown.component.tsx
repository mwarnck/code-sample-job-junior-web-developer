import { MenuItem, TextField, Tooltip, Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';

import { getStatusIcon } from '../../helpers/recommendations.helpers.utils';
import useIsAutomatedAndNotAutomationAcc from '../../helpers/useIsAutomatedAndNotAutomationAcc';
import useRecommendationsWriteAccess from '../../helpers/useRecommendationsWriteAccess';
import { RecommendationStatus } from '../recommendation-status/recommendation-status.component';

interface DropdownProps {
  handleChange: (arg1: string) => void;
  recoStatus: string;
  values: string[];
  usecase: string;
  isAutomated: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({
  handleChange,
  recoStatus,
  values,
  usecase,
  isAutomated
}) => {
  const { t } = useTranslation(['recommendations']);
  const accountHasWriteAccess = useRecommendationsWriteAccess();
  const isAutomatedAndNotAutomationAcc = useIsAutomatedAndNotAutomationAcc(isAutomated);

  // if the usecase is automated, we show only the status to the user and not a disabled dropdown
  if (isAutomatedAndNotAutomationAcc) {
    return <RecommendationStatus status={recoStatus} usecase={usecase} />;
  }

  return (
    <Tooltip
      placement='top'
      title={
        accountHasWriteAccess
          ? ''
          : t('recommendations.tooltip-read-only', {
              ns: 'recommendations'
            })
      }
    >
      <TextField
        fullWidth
        size={'small'}
        data-cy='select-value'
        id='recommendation-status'
        label={
          <Typography
            sx={{
              fontSize: 'inherit',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {t('recommendations:recommendations.status-label')}
            {recoStatus ? (
              <Tooltip
                title={`Status: ${t(`recommendations:recommendations.status.${recoStatus}`, {
                  defaultValue: ''
                })}`}
                arrow
              >
                <>{getStatusIcon(recoStatus)}</>
              </Tooltip>
            ) : (
              <>{getStatusIcon(recoStatus)}</>
            )}
          </Typography>
        }
        select
        inputProps={{
          MenuProps: { disableScrollLock: true },
          'data-cy': 'select-status'
        }}
        value={recoStatus}
        onChange={(e) => handleChange(e.target.value)}
        disabled={!accountHasWriteAccess || isAutomatedAndNotAutomationAcc}
      >
        <MenuItem value='empty' disabled sx={{ display: 'none' }} data-cy='select-option-empty'>
          {t(`recommendations:recommendations.${usecase}.status-empty`, {
            defaultValue: ''
          })}
        </MenuItem>
        {values.map((value) => (
          <MenuItem key={value} value={value} data-cy={`select-option-${value}`}>
            {t(`recommendations:recommendations.${usecase}.status-${value}`, {
              defaultValue: ''
            })}
          </MenuItem>
        ))}
      </TextField>
    </Tooltip>
  );
};
export default Dropdown;
