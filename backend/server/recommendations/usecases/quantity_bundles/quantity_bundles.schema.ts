import { Schema } from 'mongoose';
import { schemaOptions } from '../../recommendations.schema';
import { IQuantityBundlesData } from './quantity_bundles.interfaces';

export const quantityBundlesSchema = new Schema<IQuantityBundlesData>(
  {
    amazon_account_id: {
      type: Schema.Types.ObjectId
    },
    products: [
      {
        _id: false,
        sku: {
          type: String
        },
        asin: {
          type: String
        }
      }
    ],
    quantity: {
      type: Number
    },
    orders: {
      type: Number
    },
    costsavings: {
      min: {
        type: Number
      },
      max: {
        type: Number
      }
    },
    realized_savings: {
      type: Number
    },
    bundle_sku: {
      type: String
    },
    orders_new_bundle: {
      type: Number
    },
    average_saving_per_order: {
      type: Number
    },
    percentage: {
      type: Number
    },
    average_fee_per_unit: {
      type: Number
    }
  },
  schemaOptions
);
