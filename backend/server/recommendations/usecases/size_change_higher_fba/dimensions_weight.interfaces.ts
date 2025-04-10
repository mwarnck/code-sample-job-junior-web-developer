import { DimensionsUnit, WeightUnit } from '../../recommendations.types';

export interface IDimensionsWeightData {
  dimensions?: {
    width?: number;
    height?: number;
    length?: number;
    unit?: DimensionsUnit;
  };
  weight?: {
    weight?: number;
    unit?: WeightUnit;
  };
}
