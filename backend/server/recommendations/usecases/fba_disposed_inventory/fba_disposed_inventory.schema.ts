import { Schema } from 'mongoose';
import { schemaOptions } from '../../recommendations.schema';
import { IFbaDisposedInventoryData } from './fba_disposed_inventory.interfaces';

export const fbaDisposedInventorySchema = new Schema<IFbaDisposedInventoryData>(
  {
    amazon_account_id: {
      type: Schema.Types.ObjectId
    },
    sku: {
      type: String
    },
    fnsku: {
      type: String
    },
    product_name: {
      type: String
    },
    disposed_items_quantity: {
      type: Number
    },
    quantity_to_reimburse: {
      type: Number
    },
    refund_total: {
      type: Number
    }
  },
  schemaOptions
);
