import Tippy from '@tippyjs/react';
import AutoModeIcon from '@mui/icons-material/AutoMode';

interface AutomationIconProps {
  tooltip: string;
}

export const AutomationIcon: React.FC<AutomationIconProps> = ({ tooltip }) => {
  return (
    <Tippy content={tooltip}>
      <AutoModeIcon
        data-cy='recommendations-header-automated-icon'
        fontSize='inherit'
        color='primary'
        sx={{ cursor: 'help', marginLeft: 0.5 }}
      />
    </Tippy>
  );
};
