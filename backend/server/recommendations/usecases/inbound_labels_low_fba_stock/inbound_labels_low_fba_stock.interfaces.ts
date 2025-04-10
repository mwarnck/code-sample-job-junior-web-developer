import { Types } from 'mongoose';

export interface IInboundLabelsLowFbaStockData {
  amazon_account_id?: Types.ObjectId;
  sku?: string;
  inventory_date?: Date;
  country_code?: string;
  units?: number;
  units_forecast?: number;
  available_units?: number;
  fba_stock?: number;
  open_quantity?: number;
  recommended_units_to_ship?: number;
  inbound_received?: boolean;
}

export interface IInboundLabelsLowFbaStockService {}
