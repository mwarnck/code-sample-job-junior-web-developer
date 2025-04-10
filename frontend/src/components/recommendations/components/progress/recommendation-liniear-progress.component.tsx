import { LinearProgressProps, Typography } from '@mui/material';
import { Box } from '@mui/system';

import { StyledLinearProgress } from '../../recommendations.style';

export const LinearProgressWithLabel = (props: LinearProgressProps & { value: number }) => {
  const { value } = props;

  const getColor = (progress: number) => {
    switch (true) {
      case progress < 99:
        return 'primary';
      default:
        return '#22c55e';
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <StyledLinearProgress
          variant='determinate'
          color='primary'
          barcolor={getColor(value)}
          {...props}
        />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant='body2' color='text.secondary'>
          {' '}
          {`${Math.round(props.value)}%`}
        </Typography>
      </Box>
    </Box>
  );
};
