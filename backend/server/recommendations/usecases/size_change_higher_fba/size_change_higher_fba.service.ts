import { BaseService } from '../../../config/base/base.service';
import { getUserAsin } from '../../helpers/get-user-asin.helper';
import { RecommendationUseCases } from '../../recommendations.enums';
import RecommendationModel from '../../recommendations.model';
import { ISizeChangeHigherFbaService } from './size_change_higher_fba.interfaces';

class SizeChangeHigherFbaService
  extends BaseService
  implements ISizeChangeHigherFbaService
{
  private static instance: SizeChangeHigherFbaService;
  private usecase = RecommendationUseCases.SIZE_CHANGE_HIGHER_FBA;

  private constructor() {
    super();
  }

  static getInstance(): SizeChangeHigherFbaService {
    if (!this.instance) {
      this.instance = new SizeChangeHigherFbaService();
    }
    return this.instance;
  }

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

      recommendations = [
        ...recommendations,
        {
          ...recommendationData,
          currency: amazonAcc?.default_marketplace?.currency,
          name: userAsin?.name,
          image: userAsin?.image
        }
      ];
    }
    return recommendations;
  };
}

const sizeChangeHigherFbaService = SizeChangeHigherFbaService.getInstance();

export { sizeChangeHigherFbaService, SizeChangeHigherFbaService };
