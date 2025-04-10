import { Schema } from 'mongoose';
import { schemaOptions } from '../../recommendations.schema';
import { IStoragePLCZData } from './storage_pl_cz.interfaces';

export const storagePLCZSchema = new Schema<IStoragePLCZData>(
  {
    amazon_account_id: {
      type: Schema.Types.ObjectId
    },
    average_items_per_month: {
      type: Number
    },
    monthly_savings: {
      type: Number
    },
    yearly_savings: {
      type: Number
    }
  },
  schemaOptions
);
