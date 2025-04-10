import { BaseService } from '../../../config/base/base.service';
import { getUserAsin } from '../../helpers/get-user-asin.helper';
import { RecommendationUseCases } from '../../recommendations.enums';
import RecommendationModel from '../../recommendations.model';
import { IFbaMisplacedDamagedInventoryService } from './fba_misplaced_damaged_inventory.interfaces';

class FbaMisplacedDamagedInventoryService
  extends BaseService
  implements IFbaMisplacedDamagedInventoryService
{
  private static instance: FbaMisplacedDamagedInventoryService;
  private usecase = RecommendationUseCases.FBA_MISPLACED_DAMAGED_INVENTORY;

  private constructor() {
    super();
  }

  static getInstance(): FbaMisplacedDamagedInventoryService {
    if (!this.instance) {
      this.instance = new FbaMisplacedDamagedInventoryService();
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
        resolved: 1,
        created_at: -1
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
        recommendationData.sku,
        amazonAcc
      );

      recommendationData.name = userAsin?.name;
      recommendationData.image = userAsin?.image;
      recommendationData.asin = userAsin?.asin;
      recommendationData.currency = amazonAcc?.default_marketplace?.currency;
      recommendation = [...recommendation, recommendationData];
    }

    return recommendation;
  };
}

const fbaMisplacedDamagedInventoryService =
  FbaMisplacedDamagedInventoryService.getInstance();

export {
  FbaMisplacedDamagedInventoryService,
  fbaMisplacedDamagedInventoryService
};
