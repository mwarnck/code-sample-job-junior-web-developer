import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';

interface InstructionsProps {
  usecase: string;
}

const Instructions: React.FC<InstructionsProps> = ({ usecase }) => {
  const { t } = useTranslation('recommendations');

  return (
    <Grid item container spacing={2} sm={12}>
      <Grid item sm={12}>
        <Typography variant='body2'>
          {t(`recommendations:recommendations.${usecase}.text-1`, {
            defaultValue: ''
          })}
        </Typography>
      </Grid>
      <Grid item sm={12}>
        <Typography variant='body2'>
          {t(`recommendations:recommendations.${usecase}.text-2`, {
            defaultValue: ''
          })}
        </Typography>
      </Grid>
      <br />
    </Grid>
  );
};

export default Instructions;
