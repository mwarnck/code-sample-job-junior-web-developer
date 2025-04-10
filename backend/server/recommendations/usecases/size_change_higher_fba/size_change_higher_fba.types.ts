import { HydratedDocument } from 'mongoose';
import {
  IRecommendationData,
  IRecommendationMethods
} from '../../recommendations.interfaces';
import {
  ISizeChangeHigherFbaData,
  ISizeChangeHigherFbaMethods,
  ISizeChangeHigherFbaVirtuals
} from './size_change_higher_fba.interfaces';

export type HydratedSizeChangeHigherFbaRecommendationDoc = HydratedDocument<
  ISizeChangeHigherFbaData & IRecommendationData,
  ISizeChangeHigherFbaMethods & IRecommendationMethods,
  ISizeChangeHigherFbaVirtuals
>;
