import { Schema } from 'mongoose';
import { schemaOptions } from '../../recommendations.schema';
import { ICustomerReturnsRefundsData } from './customer_returns_refunds.interfaces';

export const customerReturnsRefundsSchema =
  new Schema<ICustomerReturnsRefundsData>(
    {
      amazon_account_id: {
        type: Schema.Types.ObjectId
      },
      amazon_order_id: {
        type: String
      },
      purchase_date: {
        type: Date
      },
      refunded_items: [
        {
          _id: false,
          RefundDate: {
            type: Date
          },
          SellerSKU: {
            type: String
          },
          QuantityShipped: {
            type: Number
          }
        }
      ]
    },
    schemaOptions
  );
