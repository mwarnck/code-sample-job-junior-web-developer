import { BaseService } from '../../../config/base/base.service';
import { getUserAsin } from '../../helpers/get-user-asin.helper';
import { RecommendationUseCases } from '../../recommendations.enums';
import RecommendationModel from '../../recommendations.model';
import { IProductsBundlesService } from './products_bundles.interfaces';

class ProductsBundlesService
  extends BaseService
  implements IProductsBundlesService
{
  private static instance: ProductsBundlesService;
  private usecase = RecommendationUseCases.PRODUCTS_BUNDLES;

  private constructor() {
    super();
  }

  static getInstance(): ProductsBundlesService {
    if (!this.instance) {
      this.instance = new ProductsBundlesService();
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
      let recommendationProducts: any = [];
      for await (const skuData of recommendationData.products) {
        const userAsin = await getUserAsin(
          recommendationData,
          skuData.sku,
          amazonAcc
        );
        recommendationProducts = [
          ...recommendationProducts,
          { ...skuData, name: userAsin?.name, image: userAsin?.image }
        ];
      }
      recommendations = [
        ...recommendations,
        {
          ...recommendationData,
          currency: amazonAcc?.default_marketplace?.currency,
          products: recommendationProducts
        }
      ];
    }

    return recommendations;
  };
}

const productsBundlesService = ProductsBundlesService.getInstance();

export { productsBundlesService, ProductsBundlesService };
