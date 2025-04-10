import { Schema } from 'mongoose';
import {
  IRecommendationData,
  IRecommendationMethods,
  IRecommendationModel,
  IRecommendationQueryHelpers,
  IRecommendationVirtuals
} from './recommendations.interfaces';
import { universal_statuses } from './recommendations.constants';
import { Resolvers } from './recommendations.enums';

import { validateIDs } from './helpers/validate-ids.helper';

export const schemaOptions = {
  discriminatorKey: 'usecase',
  versionKey: false,
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
};

export const RecommendationSchema = new Schema<
  IRecommendationData,
  IRecommendationModel,
  IRecommendationMethods,
  IRecommendationQueryHelpers,
  IRecommendationVirtuals
>(
  {
    usecase: {
      type: String // TODO (REFACTOR:RECOMMENDATION): enum
    },
    user_id: {
      type: Schema.Types.ObjectId,
      validate: {
        validator: async function () {
          return await validateIDs(this);
        },
        message:
          'User does not exist or is not the owner of this amazon account id'
      }
    },
    amazon_account_id: {
      type: Schema.Types.ObjectId
    },
    seen: {
      type: Boolean,
      default: false
    },
    resolved: {
      type: Boolean,
      default: false
    },
    resolved_status: {
      type: String,
      enum: universal_statuses
    },
    resolved_at: { type: Date },
    resolved_by_automation: {
      type: Boolean
    },
    // Resolver is either code (auto), user (manual), or onboarding userflow (onboarding)
    resolver: {
      type: String,
      enum: Object.values(Resolvers)
    },
    cta_id: {
      type: Schema.Types.ObjectId
    },
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Message'
      }
    ]
  },
  schemaOptions
);
