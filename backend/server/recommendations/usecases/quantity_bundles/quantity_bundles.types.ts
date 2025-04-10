import { HydratedDocument } from 'mongoose';
import {
  IRecommendationData,
  IRecommendationMethods
} from '../../recommendations.interfaces';
import {
  IQuantityBundlesData,
  IQuantityBundlesMethods,
  IQuantityBundlesVirtuals
} from './quantity_bundles.interfaces';

export type HydratedQuantityBundlesRecommendationDoc = HydratedDocument<
  IQuantityBundlesData & IRecommendationData,
  IQuantityBundlesMethods & IRecommendationMethods,
  IQuantityBundlesVirtuals
>;
