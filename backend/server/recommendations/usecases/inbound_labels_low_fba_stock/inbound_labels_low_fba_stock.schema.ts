import { Schema } from 'mongoose';
import { schemaOptions } from '../../recommendations.schema';
import { IInboundLabelsLowFbaStockData } from './inbound_labels_low_fba_stock.interfaces';

export const inboundLabelsLowFbaStockSchema =
  new Schema<IInboundLabelsLowFbaStockData>(
    {
      amazon_account_id: {
        type: Schema.Types.ObjectId
      },
      sku: {
        type: String
      },
      inventory_date: Date,
      country_code: {
        type: String
      },
      units: {
        type: Number
      },
      units_forecast: {
        type: Number
      },
      available_units: {
        type: Number
      },
      fba_stock: {
        type: Number
      },
      open_quantity: {
        type: Number
      },
      recommended_units_to_ship: {
        type: Number
      },
      inbound_received: {
        type: Boolean,
        default: false
      }
    },
    schemaOptions
  );
