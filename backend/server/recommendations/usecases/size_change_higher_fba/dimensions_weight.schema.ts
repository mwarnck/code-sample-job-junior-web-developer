import { Schema } from 'mongoose';
import { DimensionsUnits, WeightUnits } from '../../recommendations.enums';
import { IDimensionsWeightData } from './dimensions_weight.interfaces';

export const dimensionsWeightSchema = new Schema<IDimensionsWeightData>({
  // @ts-ignore
  _id: false,
  dimensions: {
    width: {
      type: Number
    },
    height: {
      type: Number
    },
    length: {
      type: Number
    },
    unit: {
      type: String,
      enum: Object.values(DimensionsUnits)
    }
  },
  weight: {
    weight: {
      type: Number
    },
    unit: {
      type: String,
      enum: Object.values(WeightUnits)
    }
  }
});
