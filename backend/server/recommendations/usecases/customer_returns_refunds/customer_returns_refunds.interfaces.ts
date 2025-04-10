import { Types } from 'mongoose';

export interface IRefundedItem {
  RefundDate?: Date;
  SellerSKU?: string;
  QuantityShipped?: number;
}

export interface ICustomerReturnsRefundsData {
  amazon_account_id?: Types.ObjectId;
  amazon_order_id?: string;
  purchase_date?: Date;
  refunded_items?: IRefundedItem[];
}

export interface ICustomerReturnsRefundsMethods {}

export interface ICustomerReturnsRefundsVirtuals {}

export interface ICustomerReturnsRefundsService {}
