import { Schema } from 'mongoose';
import { schemaOptions } from '../../recommendations.schema';
import { IProductsBundlesData } from './products_bundles.interfaces';

export const productsBundlesSchema = new Schema<IProductsBundlesData>(
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
