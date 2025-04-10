// import { Model, HydratedDocument } from 'mongoose';
// import {
//   IRecommendationMethods,
//   IRecommendationQueryHelpers,
//   IRecommendationStatics,
//   IRecommendationVirtuals
// } from './recommendations.interfaces';

import { HydratedDocument } from 'mongoose';
import {
  DimensionsUnits,
  Resolvers,
  TranslatedLanguages,
  WeightUnits
} from './recommendations.enums';
import {
  IRecommendationData,
  IRecommendationMethods,
  IRecommendationVirtuals
} from './recommendations.interfaces';

export type HydratedRecommendationDoc = HydratedDocument<
  IRecommendationData,
  IRecommendationMethods,
  IRecommendationVirtuals
>;

export type UniversalStatus =
  | 'todo'
  | 'done'
  | 'already_done'
  | 'not_interesting'
  | 'invalid'
  | 'remind_later'
  | 'never_notify'
  | 'rejected'
  | 'not_shipped'
  | 'stock_found'
  | 'verified'
  | 'accepted'
  | 'requested'
  | 'sold_out'
  | 'discontinued'
  | 'reimbursed'
  | 'expired'
  | 'corrected'
  | 'commercial_invoice'
  | 'proof_of_service';

export type AvailableFilter =
  | 'all'
  | 'messages'
  | 'resolved'
  | 'in_progress'
  | 'unresolved'
  | 'in_progress_by_automation'
  | 'resolved_by_automation';

export type Resolver = Resolvers;

export type TranslatedLanguage = TranslatedLanguages;

export type GetRecommendationCountDataResult = {
  all: number;
  resolved: number;
  unresolved: number;
};

export type IRecommendationQueryParams = {
  amazon_account_id: string;
  usecases: string[]; // ["quantity_bundles","fba_missing_inbound","products_bundles","fba_misplaced_damaged_inventory","size_change_higher_fba","inbound_labels_low_fba_stock","analyzed_returns",]
};

export type DimensionsUnit = DimensionsUnits;

export type WeightUnit = WeightUnits;

export type AllUnits = DimensionsUnit | WeightUnit;
