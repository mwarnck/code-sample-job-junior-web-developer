import { Types } from 'mongoose';

export interface IQuantityBundlesProductItem {
  sku?: string;
  asin?: string;
}

export interface IQuantityBundlesData {
  amazon_account_id?: Types.ObjectId;
  products?: IQuantityBundlesProductItem[];
  quantity?: number;
  orders?: number;
  costsavings?: {
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

export interface IQuantityBundlesMethods {}

export interface IQuantityBundlesVirtuals {}

export interface IQuantityBundlesService {}
