import { Schema } from 'mongoose';
import { schemaOptions } from '../../recommendations.schema';
import { ISizeChangeHigherFbaData } from './size_change_higher_fba.interfaces';
import { dimensionsWeightSchema } from './dimensions_weight.schema';

export const sizeChangeHigherFBASchema = new Schema<ISizeChangeHigherFbaData>(
  {
    amazon_account_id: {
      type: Schema.Types.ObjectId
    },
    sku: {
      type: String
    },
    asin: {
      type: String
    },
    additional_fees: {
      average_per_unit: {
        type: Number
      },
      monthly: {
        type: Number
      },
      yearly: {
        type: Number
      }
    },
    realized_savings: {
      type: Number
    },
    orders_since_corrected: {
      type: Number
    },
    average_saving_per_order: {
      type: Number
    },
    changed_at: {
      type: Date
    },
    before: dimensionsWeightSchema,
    after: dimensionsWeightSchema,
    confirm_wrong_measurement: {
      type: Boolean
    },
    case_id: {
      type: String
    }
  },
  schemaOptions
);
