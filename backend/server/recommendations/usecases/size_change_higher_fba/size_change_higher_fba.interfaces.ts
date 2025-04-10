import { Types } from 'mongoose';
import { IDimensionsWeightData } from './dimensions_weight.interfaces';

export interface ISizeChangeHigherFbaData {
  amazon_account_id?: Types.ObjectId;
  sku?: string;
  asin?: string;
  additional_fees?: {
    average_per_unit?: number;
    monthly?: number;
    yearly?: number;
  };
  realized_savings?: number;
  orders_since_corrected?: number;
  average_saving_per_order?: number;
  changed_at?: Date;
  before?: IDimensionsWeightData;
  after?: IDimensionsWeightData;
  confirm_wrong_measurement?: boolean;
  case_id?: string;
}

export interface ISizeChangeHigherFbaMethods {}

export interface ISizeChangeHigherFbaVirtuals {}

export interface ISizeChangeHigherFbaService {}
