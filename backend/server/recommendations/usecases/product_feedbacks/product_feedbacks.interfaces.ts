import { Types } from 'mongoose';
import { TranslatedLanguage } from '../../recommendations.types';
import { CommentType } from './product_feedbacks.types';

export interface ICommentItem {
  comment_id?: Types.ObjectId;
  type?: CommentType;
}

export interface IReasonItem {
  reason?: string;
  action?: string;
  comments?: ICommentItem[];
}

export interface IProductFeedbacksData {
  sku?: string;
  returns_percentage?: number;
  orders_count?: number;
  reason_list?: IReasonItem[];
  return_period_start?: Date;
  return_period_end?: Date;
  translated_language?: TranslatedLanguage;
}

export interface IProductFeedbacksService {}
