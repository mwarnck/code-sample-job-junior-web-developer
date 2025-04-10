import { Types } from 'mongoose';

export interface IProductsBundlesProductItem {
  sku?: string;
  asin?: string;
}

export interface IProductsBundlesData {
  amazon_account_id?: Types.ObjectId;
  products?: IProductsBundlesProductItem[];
  orders?: number;
  costsavings: {
    min?: number;
    max?: number;
  };
  realized_savings?: number;
  bundle_sku?: string;
  orders_new_bundle?: number;
  average_saving_per_order?: number;
  percentage?: number;
  average_fee_per_unit?: number;
}

export interface IProductsBundlesService {}
