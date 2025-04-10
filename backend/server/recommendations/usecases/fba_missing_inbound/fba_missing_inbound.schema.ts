import { Schema } from 'mongoose';
import { schemaOptions } from '../../recommendations.schema';
import { IFbaMissingInboundData } from './fba_missing_inbound.interfaces';

export const fbaMissingInboundSchema = new Schema<IFbaMissingInboundData>(
  {
    amazon_account_id: {
      type: Schema.Types.ObjectId
    },

    shipment_id: {
      type: String
    },
    refund_total: {
      type: Number
    },
    missings_total: {
      type: Number
    },
    case_id: {
      type: String
    },
    refund_by_skus: [
      {
        _id: false,
        sku: {
          type: String
        },
        missings: {
          type: Number
        },
        refund: {
          type: Number
        },
        quantity_shipped: {
          type: Number
        },
        quantity_received: {
          type: Number
        },
        quantity_send: {
          type: Number
        }
      }
    ],
    reimbursement_amount: {
      type: Number
    },
    reimbursement_quantity: {
      type: Number
    },
    stock_found_quantity: {
      type: Number
    },
    shipment_date: {
      type: Date
    }
  },
  schemaOptions
);
