import { Schema } from 'mongoose';
import { schemaOptions } from '../../recommendations.schema';
import { IFbaDamagedInventoryData } from './fba_damaged_inventory.interfaces';

export const fbaDamagedInventorySchema = new Schema<IFbaDamagedInventoryData>(
  {
    amazon_account_id: {
      type: Schema.Types.ObjectId
    },
    reference_id: {
      type: String
    },
    reimbursement_id: {
      type: String
    },
    sku: {
      type: String
    },
    fnsku: {
      type: String
    },
    title: {
      type: String
    },
    adjusted_date: {
      type: Date
    },
    damaged_items_quantity: {
      type: Number
    },
    unreconciled_quantity: {
      type: Number
    },
    reconciled_quantity: {
      type: Number
    },
    reason: {
      type: String
    },
    refund_total: {
      type: Number
    }
  },
  schemaOptions
);
