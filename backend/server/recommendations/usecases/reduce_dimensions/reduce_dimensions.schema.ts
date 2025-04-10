import { Schema } from 'mongoose';
import { schemaOptions } from '../../recommendations.schema';
import { DimensionsUnits, WeightUnits } from '../../recommendations.enums';
import { IReduceDimensionsData } from './reduce_dimensions.interfaces';

export const reduceDimensionsSchema = new Schema<IReduceDimensionsData>(
  {
    amazon_account_id: {
      type: Schema.Types.ObjectId
    },
    user_id: {
      type: Schema.Types.ObjectId
    },
    sku: {
      type: String
    },
    current_dimensions: {
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
    target_dimensions: {
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
    current_weight: {
      unit: {
        weight: {
          type: Number
        },
        unit: {
          type: String,
          enum: Object.values(WeightUnits)
        }
      },
      volume: {
        weight: {
          type: Number
        },
        unit: {
          type: String,
          enum: Object.values(WeightUnits)
        }
      }
    },
    target_weight: {
      unit: {
        weight: {
          type: Number
        },
        unit: {
          type: String,
          enum: Object.values(WeightUnits)
        }
      },
      volume: {
        weight: {
          type: Number
        },
        unit: {
          type: String,
          enum: Object.values(WeightUnits)
        }
      }
    },
    needed_reductions: {
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
        enums: [
          ...Object.values(DimensionsUnits),
          ...Object.values(WeightUnits)
        ]
      },
      weight: {
        type: Number
      }
    },
    needed_reductions_volumeweight: {
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
    orders: {
      type: Number
    },
    potential_costsavings: {
      type: Number
    },
    average_costsaving_per_order: {
      type: Number
    }
  },
  schemaOptions
);
