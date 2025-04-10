import { Types } from 'mongoose';

export interface IFbaMisplacedDamagedInventoryData {
  amazon_account_id?: Types.ObjectId;
  user_id?: Types.ObjectId;
  sku?: string;
  fnsku?: string;
  asin?: string;
  title?: string;
  items?: {
    unreconciled?: number;
    open?: number;
    reimbursed?: number;
    stock_found?: number;
    rejected?: number;
  };
  refunds?: {
    possible?: number;
    reimbursed?: number;
    possible_per_item?: number;
  };
}

export interface IFbaMisplacedDamagedInventoryMethods {}

export interface IFbaMisplacedDamagedInventoryVirtuals {}

export interface IFbaMisplacedDamagedInventoryService {}
