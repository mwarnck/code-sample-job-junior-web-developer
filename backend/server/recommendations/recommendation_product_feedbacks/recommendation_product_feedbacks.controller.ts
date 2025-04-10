import { NextFunction, Response } from 'express';

import {
  IGetTranslatedCommentsRequest,
  IRecommendationProductFeedbacksController
} from './recommendation_product_feedbacks.interfaces';
import { RecommendationProductFeedbacksService } from './recommendation_product_feedbacks.service';

class RecommendationProductFeedbacksController
  implements IRecommendationProductFeedbacksController
{
  private static instance: RecommendationProductFeedbacksController;
  private service: RecommendationProductFeedbacksService;

  private constructor(service: RecommendationProductFeedbacksService) {
    this.service = service;
  }

  static getInstance(): RecommendationProductFeedbacksController {
    if (!this.instance) {
      const recommendationsReasonsService =
        RecommendationProductFeedbacksService.getInstance();
      this.instance = new RecommendationProductFeedbacksController(
        recommendationsReasonsService
      );
    }
    return this.instance;
  }

  getTranslatedComments = async (
    req: IGetTranslatedCommentsRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { comments } = req.body;
      const user = req.user;
      const { amazon_account_id } = req.params;

      const translatedComments = await this.service.getTranslatedComments(
        user.language,
        amazon_account_id,
        comments
      );

      res.status(200).json({ data: translatedComments });
    } catch (error) {
      next(error);
    }
  };
}

const recommendationProductFeedbacksController =
  RecommendationProductFeedbacksController.getInstance();
export {
  recommendationProductFeedbacksController,
  RecommendationProductFeedbacksController
};
