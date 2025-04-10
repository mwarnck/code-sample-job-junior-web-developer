import { Schema } from 'mongoose';
import { schemaOptions } from '../../recommendations.schema';
import { TranslatedLanguages } from '../../recommendations.enums';
import { IProductFeedbacksData } from './product_feedbacks.interfaces';
import { CommentTypes } from './product_feedbacks.enums';

export const productFeedbacksSchema = new Schema<IProductFeedbacksData>(
  {
    sku: {
      type: String
    },
    returns_percentage: {
      type: Number
    },
    orders_count: {
      type: Number
    },

    reason_list: [
      {
        _id: false,
        reason: {
          type: String
        },
        action: {
          type: String
        },
        comments: [
          {
            _id: false,
            comment_id: {
              type: Schema.Types.ObjectId
            },
            type: {
              type: String,
              enum: Object.values(CommentTypes)
            }
          }
        ]
      }
    ],
    return_period_start: {
      type: Date
    },
    return_period_end: {
      type: Date
    },
    translated_language: {
      type: String,
      enum: Object.values(TranslatedLanguages)
    }
  },
  schemaOptions
);
