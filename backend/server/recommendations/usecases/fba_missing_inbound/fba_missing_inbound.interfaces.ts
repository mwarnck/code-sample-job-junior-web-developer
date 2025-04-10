import { Types } from 'mongoose';
import { TranslatedLanguage } from '../../recommendations.types';
import { HydratedFbaMissingInboundRecommendationDoc } from './fba_missing_inbound.types';

export interface IRefundBySkusItem {
  sku?: string;
  missings?: number;
  refund?: number;
  quantity_shipped?: number;
  quantity_received?: number;
  quantity_send?: number;
}

// export interface IFbaMissingInboundData extends IRecommendationData {
export interface IFbaMissingInboundData {
  amazon_account_id?: Types.ObjectId;
  shipment_id?: string;
  refund_total?: number;
  missings_total?: number;
  case_id?: string;
  refund_by_skus?: IRefundBySkusItem[];
  reimbursement_amount?: number;
  reimbursement_quantity?: number;
  stock_found_quantity?: number;
  shipment_date?: Date;
}

export interface IFbaMissingInboundMethods {}

export interface IFbaMissingInboundService {
  createPackingListForOneMissingInboundRecommendation: (
    recommendation: HydratedFbaMissingInboundRecommendationDoc,
    language: TranslatedLanguage,
    saveToFile?: boolean
  ) => Promise<Buffer>;
}

// export interface IFbaMissingInboundVirtuals extends IRecommendationVirtuals {
export interface IFbaMissingInboundVirtuals {}
