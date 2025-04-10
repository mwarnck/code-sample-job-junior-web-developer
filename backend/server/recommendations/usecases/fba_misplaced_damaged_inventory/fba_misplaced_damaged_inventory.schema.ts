import { Schema } from 'mongoose';
import { schemaOptions } from '../../recommendations.schema';
import { IFbaMisplacedDamagedInventoryData } from './fba_misplaced_damaged_inventory.interfaces';

export const fbaMisplacedDamagedInventorySchema =
  new Schema<IFbaMisplacedDamagedInventoryData>(
    {
      amazon_account_id: {
        type: Schema.Types.ObjectId
      },
      user_id: {
        type: Schema.Types.ObjectId
      },
      sku: {
        type: String
      },
      fnsku: {
        type: String
      },
      asin: {
        type: String
      },
      title: {
        type: String
      },
      items: {
        _id: false,
        unreconciled: { type: Number },
        open: { type: Number },
        reimbursed: { type: Number },
        stock_found: { type: Number },
        rejected: { type: Number }
      },
      refunds: {
        _id: false,
        possible: { type: Number },
        reimbursed: { type: Number },
        possible_per_item: { type: Number }
      }
    },
    schemaOptions
  );
