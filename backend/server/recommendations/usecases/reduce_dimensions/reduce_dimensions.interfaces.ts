import { Types } from 'mongoose';
import { DimensionsUnits, WeightUnits } from '../../recommendations.enums';
import { DimensionsUnit, AllUnits } from '../../recommendations.types';

export interface IReduceDimensionsData {
  amazon_account_id?: Types.ObjectId;
  user_id?: Types.ObjectId;
  sku?: string;
  current_dimensions?: {
    width?: number;
    height?: number;
    length?: number;
    unit?: DimensionsUnit;
  };
  target_dimensions?: {
    width?: number;
    height?: number;
    length?: number;
    unit?: DimensionsUnits;
  };
  current_weight?: {
    unit?: {
      weight?: number;
      unit?: WeightUnits;
    };
    volume?: {
      weight?: number;
      unit?: WeightUnits;
    };
  };
  target_weight?: {
    unit?: {
      weight?: number;
      unit?: WeightUnits;
    };
    volume?: {
      weight?: number;
      unit?: WeightUnits;
    };
  };
  needed_reductions?: {
    width?: number;
    height?: number;
    length?: number;
    unit?: AllUnits;
    weight?: number;
  };
  needed_reductions_volumeweight?: {
    width?: number;
    height?: number;
    length?: number;
    unit?: DimensionsUnits;
  };
  orders?: number;
  potential_costsavings?: number;
  average_costsaving_per_order?: number;
}

export interface IReduceDimensionsService {}
