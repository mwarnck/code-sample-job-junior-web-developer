import { BaseService } from '../../../config/base/base.service';
import { getUserAsin } from '../../helpers/get-user-asin.helper';
import { RecommendationUseCases } from '../../recommendations.enums';
import RecommendationModel from '../../recommendations.model';
import { IProductFeedbacksService } from './product_feedbacks.interfaces';

class ProductFeedbacksService
  extends BaseService
  implements IProductFeedbacksService
{
  private static instance: ProductFeedbacksService;
  private usecase = RecommendationUseCases.PRODUCT_FEEDBACKS;

  private constructor() {
    super();
  }

  static getInstance(): ProductFeedbacksService {
    if (!this.instance) {
      this.instance = new ProductFeedbacksService();
    }
    return this.instance;
  }

  /**
   * Filters the product feedback reasons list based on specific conditions
   */
  public filterProductFeedbacksReasonList = (recommendationData: any) => {
    let length_all_comments = 0;
    // Calculate the total number of comments across all reasons in the list
    recommendationData.reason_list.forEach((x: any) => {
      length_all_comments += x.comments.length;
    });

    // Transform the reason list based on conditions applied to each element
    const updated_reason_list = recommendationData.reason_list.map(
      (x: any, idx: any) => {
        // Always return the first element unmodified
        if (idx === 0) return x;

        // For the second and third elements in the list, apply additional filters:
        if (
          idx < 3 && // Check if the element is either the second or third in the list
          recommendationData.reason_list.length > idx && // Ensure the current index is within the list bounds
          recommendationData.reason_list.filter(
            (reason: any) => reason.action === x.action
          ).length === 1 && // Ensure this action is unique in the list
          (100 / length_all_comments) * x.comments.length > 15 // Check if this reason's comment
        ) {
          return x; // Return the reason unmodified if all conditions are met
        }
        // If conditions are not met, return a simplified object with only the reason and its comments
        return { reason: x.reason, comments: x.comments };
      }
    );

    // Return the newly filtered and possibly modified reason list
    return updated_reason_list;
  };

  getRecommendations = async (user: any, amazon_account_id: string) => {
    const userRecommendations: any = await RecommendationModel.find({
      usecase: this.usecase,
      amazon_account_id,
      cta_id: { $exists: true }
    })
      .sort({
        created_at: -1,
        resolved: 1
      })
      .lean();

    let recommendations: any = [];
    for await (const recommendationData of userRecommendations) {
      const amazonAcc = user.amazon_accounts.find(
        (acc: any) =>
          acc._id.toString() === recommendationData.amazon_account_id.toString()
      );
      const userAsin = await getUserAsin(
        recommendationData,
        recommendationData.sku,
        amazonAcc
      );

      const reason_list =
        this.filterProductFeedbacksReasonList(recommendationData);

      recommendations = [
        ...recommendations,
        {
          ...recommendationData,
          currency: amazonAcc?.default_marketplace?.currency,
          name: userAsin?.name,
          image: userAsin?.image,
          asin: userAsin?.asin,
          reason_list
        }
      ];
    }
    return recommendations;
  };
}

const productFeedbacksService = ProductFeedbacksService.getInstance();

export { productFeedbacksService, ProductFeedbacksService };
