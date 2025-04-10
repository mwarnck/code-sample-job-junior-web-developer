import { Grid, GridProps } from '@mui/material';

interface UseCaseContainerProps extends GridProps {
  isResolved?: boolean;
}

export const UseCaseContainer: React.FC<UseCaseContainerProps> = ({
  children,
  isResolved,
  ...props
}) => {
  return (
    <Grid
      sx={{
        backgroundColor: (theme) => (isResolved ? theme.palette.grey[100] : theme.palette.grey[0]),
        opacity: isResolved ? 0.8 : 1,
        borderRadius: 1,
        border: '1px solid #e2e8f0',
        p: 2
      }}
      {...props}
    >
      {children}
    </Grid>
  );
};
