import { Types } from 'mongoose';

export interface IFbaDisposedInventoryData {
  amazon_account_id?: Types.ObjectId;
  sku?: string;
  fnsku?: string;
  product_name?: string;
  disposed_items_quantity?: number;
  quantity_to_reimburse?: number;
  refund_total?: number;
}

export interface IFbaDisposedInventoryMethods {}

export interface IFbaDisposedInventoryVirtuals {}

export interface IFbaDisposedInventoryService {}
