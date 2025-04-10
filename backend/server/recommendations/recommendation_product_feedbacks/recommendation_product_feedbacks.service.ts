import { ReviewsService } from '../../reviews/reviews.service';
import { ReturnsService } from '../../returns/returns.service';
import { TranslationService } from '../../translation/translation.service';
import mongoose from 'mongoose';
import {
  IComments,
  TComment
} from './recommendation_product_feedbacks.interfaces';
import { TCommentWithDate } from './recommendation_product_feedbacks.types';

class RecommendationProductFeedbacksService {
  private static instance: RecommendationProductFeedbacksService;
  private reviewsService: ReviewsService;
  private returnsService: ReturnsService;
  private translationService: TranslationService;

  private constructor() {
    this.reviewsService = ReviewsService.getInstance();
    this.returnsService = ReturnsService.getInstance();
    this.translationService = TranslationService.getInstance();
  }

  static getInstance(): RecommendationProductFeedbacksService {
    if (!this.instance) {
      this.instance = new RecommendationProductFeedbacksService();
    }
    return this.instance;
  }

  getTranslatedComments = async (
    userLanguage: string,
    amazon_account_id: string,
    comments: IComments
  ): Promise<TCommentWithDate[]> => {
    const reviewComments =
      await this.reviewsService.getReviewsCommentsByAmazonAccountId({
        amazon_account_id,
        comments: comments
          .filter((obj) => obj.type === 'reviews')
          .map((obj: TComment) => new mongoose.Types.ObjectId(obj.comment_id))
      });

    const returnComments =
      await this.returnsService.getReturnCommentsByAmazonAccountId({
        amazon_account_id,
        comments: comments
          .filter((obj) => obj.type === 'returns')
          .map((obj: TComment) => new mongoose.Types.ObjectId(obj.comment_id))
      });

    const allComments = [...reviewComments, ...returnComments];

    const translatedComments = await this.translationService.translate(
      userLanguage,
      allComments.map((comment) => comment.comment)
    );

    for (const translatedComment of translatedComments) {
      const matchingTranslation = allComments.find(
        (comment) => comment.comment === translatedComment.untranslated
      );
      if (matchingTranslation?.comment) {
        matchingTranslation.comment = translatedComment.translated;
      }
    }

    return allComments;
  };
}

const recommendationProductFeedbacksService =
  RecommendationProductFeedbacksService.getInstance();
export {
  recommendationProductFeedbacksService,
  RecommendationProductFeedbacksService
};
