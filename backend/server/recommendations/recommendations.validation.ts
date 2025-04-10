import { Types } from 'mongoose';
import {
  universal_statuses,
  recommendation_types
} from './recommendations.constants';
import { body, param, ParamSchema, query } from 'express-validator';

export const recommendationId = {
  inParams: {
    recommendation_id: {
      in: ['params'],
      custom: {
        options: (value: string) => {
          if (!Types.ObjectId.isValid(value)) {
            return Promise.reject();
          }
          return Promise.resolve();
        }
      },
      errorMessage: 'Recommendation ID is required'
    } as ParamSchema
  }
};

export const usecase = {
  inBody: {
    usecase: {
      in: ['body'],
      errorMessage: 'Use case is required',
      isString: true,
      trim: true,
      escape: true,
      custom: {
        options: (value: string) => recommendation_types.includes(value),
        errorMessage: `usecase should be one of the following: ${recommendation_types.join(
          ', '
        )}`
      }
    } as ParamSchema
  },
  inQuery: {
    usecase: {
      in: 'query',
      optional: true,
      isString: true,
      trim: true,
      custom: {
        options: (value: string) =>
          ['all', ...recommendation_types].includes(value),
        errorMessage: `usecase should be either 'all' or one of the following: ${recommendation_types.join(
          ', '
        )}`
      }
    } as ParamSchema
  }
};

export const case_reimbursement_id = {
  inBody: {
    case_reimbursement_id: {
      in: ['body'],
      errorMessage: 'Case reimbursement ID is required',
      isString: true,
      trim: true,
      escape: true
    } as ParamSchema
  }
};

export const bundle_sku = {
  inBody: {
    bundle_sku: {
      in: ['body'],
      errorMessage: 'Bundle SKU is required',
      isString: true,
      trim: true,
      escape: true
    } as ParamSchema
  }
};

export const missing_inbound_items = {
  inBody: {
    items: {
      in: ['body'],
      errorMessage: 'Items are required',
      isArray: true
    } as ParamSchema
  }
};

export const resolved_status = {
  inBody: {
    resolved_status: {
      in: ['body'],
      errorMessage: 'Resolved status is required',
      isString: true,
      trim: true,
      escape: true,
      custom: {
        options: (value: string) => universal_statuses.includes(value),
        errorMessage: `resolved_status should be one of the following: ${universal_statuses.join(
          ', '
        )}`
      }
    } as ParamSchema
  }
};

export const usecase_BodyValidationChain = body('usecase').custom(
  (value: string) => recommendation_types.includes(value)
);

export const recommendationsGetAllValidationChain = [
  param('amazon_account_id').isMongoId(),
  query('usecase')
    .optional()
    .custom((value: string) => recommendation_types.includes(value))
];
