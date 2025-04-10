import { useTranslation } from 'next-i18next';

import { Grid, SxProps, Typography } from '@mui/material';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { Fragment } from 'react';

type Detail = {
  name: string;
  value: string | number | JSX.Element;
  customNameStyle?: SxProps;
  customValueStyle?: SxProps;
  customContainerStyle?: SxProps;
  containerToolTip?: string | null;
  nameTranslationProps?: {
    [key: string]: string | number;
  };
} | null;

interface UsecaseDetailsProps {
  usecase: string;
  details: Detail[];
  customStyles?: SxProps;
  detailsLength?: number;
}

const UsecaseDetails: React.FC<UsecaseDetailsProps> = ({ usecase, details, detailsLength = 1 }) => {
  const { t } = useTranslation(['recommendations', 'common']);

  const detailContent = (detail: Detail) => {
    return (
      <Grid item xs={6} sm={4} md={12 / detailsLength}>
        <Typography variant='body2' sx={{ ...detail?.customNameStyle }}>
          {t(`recommendations:recommendations.${usecase}.${detail?.name}`, {
            defaultValue: '',
            ...detail?.nameTranslationProps
          })}
        </Typography>
        <Typography
          variant='h6'
          sx={{
            fontWeight: 'bold',
            color: 'primary.main',
            display: 'initial',
            ...detail?.customValueStyle
          }}
        >
          {detail?.value}
        </Typography>
      </Grid>
    );
  };
  return (
    <>
      {details.map((detail: Detail) =>
        detail?.containerToolTip ? (
          <Tippy
            key={`${usecase}-${detail?.name}-${detail?.value}-tooltip`}
            content={t(`recommendations:recommendations.${usecase}.${detail?.containerToolTip}`, {
              defaultValue: ''
            })}
          >
            {detailContent(detail)}
          </Tippy>
        ) : (
          <Fragment key={`${usecase}-${detail?.name}-${detail?.value}-tooltip`}>
            {detailContent(detail)}
          </Fragment>
        )
      )}
    </>
  );
};

export default UsecaseDetails;
