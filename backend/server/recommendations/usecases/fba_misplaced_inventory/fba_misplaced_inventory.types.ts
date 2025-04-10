import { HydratedDocument } from 'mongoose';
import {
  IFbaMisplacedInventoryData,
  IFbaMisplacedInventoryMethods,
  IFbaMisplacedInventoryVirtuals
} from './fba_misplaced_inventory.interfaces';
import {
  IRecommendationData,
  IRecommendationMethods
} from '../../recommendations.interfaces';

export type HydratedFbaMisplacedInventoryRecommendationDoc = HydratedDocument<
  IFbaMisplacedInventoryData & IRecommendationData,
  IFbaMisplacedInventoryMethods & IRecommendationMethods,
  IFbaMisplacedInventoryVirtuals
>;
