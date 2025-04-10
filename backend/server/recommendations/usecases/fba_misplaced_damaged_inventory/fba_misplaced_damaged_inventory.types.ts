import { HydratedDocument } from 'mongoose';
import {
  IFbaMisplacedDamagedInventoryData,
  IFbaMisplacedDamagedInventoryMethods,
  IFbaMisplacedDamagedInventoryVirtuals
} from './fba_misplaced_damaged_inventory.interfaces';
import {
  IRecommendationData,
  IRecommendationMethods
} from '../../recommendations.interfaces';

export type HydratedFbaMisplacedDamagedInventoryRecommendationDoc =
  HydratedDocument<
    IFbaMisplacedDamagedInventoryData & IRecommendationData,
    IFbaMisplacedDamagedInventoryMethods & IRecommendationMethods,
    IFbaMisplacedDamagedInventoryVirtuals
  >;
