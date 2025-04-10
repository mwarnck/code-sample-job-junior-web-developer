import { Types } from 'mongoose';

export interface IFbaDamagedInventoryData {
  amazon_account_id?: Types.ObjectId;
  reference_id?: string;
  reimbursement_id?: string;
  sku?: string;
  fnsku?: string;
  title?: string;
  adjusted_date?: Date;
  damaged_items_quantity?: number;
  unreconciled_quantity?: number;
  reconciled_quantity?: number;
  reason?: string;
  refund_total?: number;
}

export interface IFbaDamagedInventoryMethods {}

export interface IFbaDamagedInventoryVirtuals {}

export interface IFbaDamagedInventoryService {}
