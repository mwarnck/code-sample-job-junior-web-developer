import { Types } from 'mongoose';

export interface IStoragePLCZData {
  amazon_account_id?: Types.ObjectId;
  average_items_per_month?: number;
  monthly_savings?: number;
  yearly_savings?: number;
}
export interface IStoragePLCZService {}
