import { BaseService } from '../../../config/base/base.service';
import { getUserAsin } from '../../helpers/get-user-asin.helper';
import { RecommendationUseCases } from '../../recommendations.enums';
import RecommendationModel from '../../recommendations.model';
import { IQuantityBundlesService } from './quantity_bundles.interfaces';

class QuantityBundlesService
  extends BaseService
  implements IQuantityBundlesService
{
  private static instance: QuantityBundlesService;
  private usecase = RecommendationUseCases.QUANTITY_BUNDLES;

  private constructor() {
    super();
  }

  static getInstance(): QuantityBundlesService {
    if (!this.instance) {
      this.instance = new QuantityBundlesService();
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
    let recommendation: any = [];
    for await (const recommendationData of userRecommendations) {
      const amazonAcc = user.amazon_accounts.find(
        (acc: any) =>
          acc._id.toString() === recommendationData.amazon_account_id.toString()
      );

      // get UserAsin for each recommendation
      const userAsin = await getUserAsin(
        recommendationData,
        recommendationData.products[0].sku,
        amazonAcc
      );

      recommendationData.name = userAsin?.name;
      recommendationData.image = userAsin?.image;
      recommendationData.currency = amazonAcc?.default_marketplace?.currency;
      recommendation = [...recommendation, recommendationData];
    }

    return recommendation;
  };
}

const quantityBundlesService = QuantityBundlesService.getInstance();

export { quantityBundlesService, QuantityBundlesService };
