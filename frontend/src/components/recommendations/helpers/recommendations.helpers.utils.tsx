import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CancelScheduleSendIcon from '@mui/icons-material/CancelScheduleSend';
import CheckIcon from '@mui/icons-material/Check';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ChecklistIcon from '@mui/icons-material/Checklist';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import HourglassBottomOutlinedIcon from '@mui/icons-material/HourglassBottomOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import VerifiedIcon from '@mui/icons-material/Verified';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { i18n } from 'next-i18next';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';

import { AssistantCta } from '@/components/assistant/types/assistant-cta.type';

import { formatFloat } from '../../dashboard/helpers/format-float.helper';
import {
  FbaMissingInboundRecommendation,
  ProductBundleRecommendation,
  QuantityBundleRecommendation,
  Recommendation,
  SizeChangeHigherFbaRecommendation
} from '@/types/recommendations/recommendation.type';

export const getStatusColor = (status) => {
  const colorMap = {
    empty: 'grey.500',
    todo: 'grey.500',
    done: 'primary.main',
    accepted: 'primary.main',
    already_done: 'primary.main',
    rejected: 'error.main',
    not_shipped: 'grey.500',
    not_interesting: 'grey.500',
    stock_found: 'primary.main',
    expired: 'grey.500',
    verified: 'primary.main',
    requested: 'warning.main',
    sold_out: 'error.main',
    discontinued: 'grey.500',
    reimbursed: 'primary.main',
    corrected: 'primary.main',
    commercial_invoice: 'warning.main',
    proof_of_service: 'warning.main',
    confirm_quantity: 'warning.main'
  };

  return colorMap[status] || null;
};

export const convertToCta = {
  classic_cta: (recommendation: Recommendation) => {
    const cta: AssistantCta = {
      _id: recommendation.cta_id,
      amazon_account_id: recommendation.amazon_account_id,
      group_type: recommendation.usecase,
      user_id: recommendation.user_id,
      items: [
        {
          item_id: recommendation._id,
          item_type: 'recommendations',
          content: recommendation
        }
      ]
    };
    return cta;
  },
  automation_message_cta: (recommendation: Recommendation) => {
    const cta: AssistantCta = {
      _id: recommendation.cta_id,
      amazon_account_id: recommendation.amazon_account_id,
      group_type: recommendation.usecase + '_message',
      user_id: recommendation.user_id,
      items: [
        {
          item_id: recommendation._id,
          item_type: 'recommendations',
          content: recommendation,
          messages: recommendation.messages
        }
      ]
    };
    return cta;
  }
};

export const getStatusIcon = (status: string, styling?: { [key: string]: string | number }) => {
  const style = { marginLeft: 0.5, color: getStatusColor(status), ...styling };

  if (status === 'empty') {
    return <FormatListBulletedIcon sx={style} />;
  }

  if (status === 'todo') {
    return <ChecklistIcon sx={style} />;
  }

  if (status === 'done') {
    return <DoneAllIcon sx={style} />;
  }

  if (status === 'accepted') {
    return <CheckIcon sx={style} />;
  }

  if (status === 'already_done') {
    return <CheckCircleOutlineIcon sx={style} />;
  }

  if (status === 'rejected') {
    return <DoDisturbIcon sx={style} />;
  }

  if (status === 'not_shipped') {
    return <CancelScheduleSendIcon sx={style} />;
  }

  if (status === 'not_interesting') {
    return <NotInterestedIcon sx={style} />;
  }
  if (status === 'stock_found') {
    return <Inventory2OutlinedIcon sx={style} />;
  }

  if (status === 'expired') {
    return <HourglassBottomOutlinedIcon sx={style} />;
  }

  if (status === 'verified') {
    return <VerifiedIcon sx={style} />;
  }

  if (status === 'requested') {
    return <AccessTimeIcon sx={style} />;
  }

  if (status === 'sold_out') {
    return <RemoveShoppingCartIcon sx={style} />;
  }

  if (status === 'discontinued') {
    return <RemoveCircleOutlineIcon sx={style} />;
  }

  if (status === 'reimbursed') {
    return <MonetizationOnOutlinedIcon sx={style} />;
  }

  if (status === 'corrected') {
    return <VerifiedIcon sx={style} />;
  }

  if (status === 'commercial_invoice') {
    return <DescriptionOutlinedIcon sx={style} />;
  }
  if (status === 'proof_of_service') {
    return <DescriptionOutlinedIcon sx={style} />;
  }
  if (status === 'confirm_quantity') {
    return <DescriptionOutlinedIcon sx={style} />;
  }
};

export const createDigitNumber = (amount: number, currency?: string) => {
  return `${formatFloat({
    amount: amount,
    decimal: i18n?.t('general.decimalPoint', { ns: 'common' }),
    thousands: i18n?.t('general.thousandPoint', { ns: 'common' })
  })}
  ${
    currency
      ? i18n?.t(`common:general.currency.${currency}`, {
          defaultValue: ''
        })
      : ''
  }`;
};
export const getDigitCount = (value: string) => {
  if (!value || typeof value !== 'string') {
    return 0;
  }
  const splited = value?.split('.');
  return splited?.[1]?.length || 0;
};
export const createDimensionsString = (dimensionsObject) => {
  const length = formatFloat({
    amount: dimensionsObject?.length?.toString(),
    decimalCount: getDigitCount(dimensionsObject?.length?.toString()),
    decimal: i18n?.t('common:general.decimalPoint'),
    thousands: i18n?.t('common:general.thousandPoint')
  });
  const width = formatFloat({
    amount: dimensionsObject?.width?.toString(),
    decimalCount: getDigitCount(dimensionsObject?.width?.toString()),
    decimal: i18n?.t('common:general.decimalPoint'),
    thousands: i18n?.t('common:general.thousandPoint')
  });
  const height = formatFloat({
    amount: dimensionsObject?.height?.toString(),
    decimalCount: getDigitCount(dimensionsObject?.height?.toString()),
    decimal: i18n?.t('common:general.decimalPoint'),
    thousands: i18n?.t('common:general.thousandPoint')
  });
  return `${length} x ${width} x ${height} ${
    dimensionsObject?.unit
      ? i18n?.t(`common:general.units.${dimensionsObject?.unit}`, {
          defaultValue: ''
        })
      : ''
  }`;
};
export const createWeightString = (dimensionsObject) => {
  const weight = formatFloat({
    amount: dimensionsObject?.weight?.toString(),
    decimalCount: getDigitCount(dimensionsObject?.weight?.toString()),
    decimal: i18n?.t('common:general.decimalPoint'),
    thousands: i18n?.t('common:general.thousandPoint')
  });
  return `${weight} ${
    dimensionsObject?.unit
      ? i18n?.t(`common:general.units.${dimensionsObject?.unit}`, {
          defaultValue: ''
        })
      : ''
  }`;
};

export const getUsecaseDetailsLength = (
  minLength: number,
  usecaseData:
    | FbaMissingInboundRecommendation
    | ProductBundleRecommendation
    | QuantityBundleRecommendation
    | SizeChangeHigherFbaRecommendation,
  keysToCheck: string[] = []
) => {
  let length = minLength;

  keysToCheck.map((key) => {
    if (usecaseData[key] > 0) {
      length += 1;
    }
  });

  return length;
};
