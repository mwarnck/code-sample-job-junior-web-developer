import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { Accordion, AccordionSummary, Box, Card, LinearProgress } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
// Grid version 2
import { styled } from '@mui/material/styles';

import { GREY } from '@/lib/styles/palette.style';
import { customShadows } from '@/lib/styles/shadows.style';

interface StyledArrowIconProps {
  isopen: string;
}

export const StyledArrowIcon = styled(ArrowBackIosNewIcon, {
  shouldForwardProp: (prop) => prop !== 'isopen'
})<StyledArrowIconProps>(({ theme, isopen }) => ({
  width: 24,
  height: 24,
  transform: ` ${isopen === 'true' ? 'rotate(90deg)' : 'rotate(270deg)'}`,
  marginRight: '16px',
  borderRadius: 100,
  padding: 4,
  backgroundColor: theme.palette.grey[300],
  cursor: 'pointer'
}));

export const NotifacationCounterStyle = styled(Box)(() => ({
  padding: 0,
  margin: 0
}));

export const StyledAccordion = styled(Accordion)(() => ({
  marginBottom: 8,
  borderRadius: 8
}));

export const StickyAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  gap: 1,
  flexDirection: 'row-reverse',
  position: 'sticky',
  backgroundColor: theme.palette.grey[0],
  top: 64,
  zIndex: 500,
  borderRadius: 8,
  borderBottom: `1px solid ${GREY[300]}`
}));

export const GridContainer = styled(Grid)(() => ({
  justifyContent: 'space-between'
}));

export const TabsStyledComponent = styled(Card, {
  shouldForwardProp: (prop) =>
    prop !== 'isCollapse' && prop !== 'isOffset' && prop !== 'verticalLayout'
})(({ theme }) => ({
  zIndex: theme.zIndex.appBar - 1,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: 'background.paper',
  margin: 8,
  marginBottom: 32,
  borderRadius: 8,
  padding: 4,
  boxShadow: customShadows.light.dropdown,
  transition: theme.transitions.create(['width', 'height'], {
    duration: theme.transitions.duration.shorter
  })
}));

interface StyledLinearProgressProps {
  barColor: string;
}
export const StyledLinearProgress = styled(LinearProgress, {
  shouldForwardProp: (prop) => prop !== 'barColor'
})<StyledLinearProgressProps>(({ barColor }) => ({
  '.MuiLinearProgress-bar': {
    backgroundColor: barColor
  }
}));
