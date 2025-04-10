import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';
const UserModel = require('./../user/user.model');

export type TComment = {
  comment_id: Types.ObjectId | string;
  type: 'returns' | 'reviews';
};

export interface IComments extends Array<TComment> {}

export interface IGetTranslatedCommentsRequest extends Request {
  user?: InstanceType<typeof UserModel>;
  body: {
    comments: IComments;
  };
}

export interface IRecommendationProductFeedbacksController {
  getTranslatedComments(
    req: IGetTranslatedCommentsRequest,
    res: Response,
    next: NextFunction
  ): Promise<void>;
}
