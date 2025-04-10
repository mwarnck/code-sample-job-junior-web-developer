import { BaseService } from '../../../config/base/base.service';
import { getUserAsin } from '../../helpers/get-user-asin.helper';
import { RecommendationUseCases } from '../../recommendations.enums';
import RecommendationModel from '../../recommendations.model';
import { IInboundLabelsLowFbaStockService } from './inbound_labels_low_fba_stock.interfaces';

class InboundLabelsLowFbaStockService
  extends BaseService
  implements IInboundLabelsLowFbaStockService
{
  private static instance: InboundLabelsLowFbaStockService;
  private usecase = RecommendationUseCases.INBOUND_LABELS_LOW_FBA_STOCK;

  private constructor() {
    super();
  }

  static getInstance(): InboundLabelsLowFbaStockService {
    if (!this.instance) {
      this.instance = new InboundLabelsLowFbaStockService();
    }
    return this.instance;
  }

  getRecommendations = async (user: any, amazon_account_id: string) => {
    const userRecommendations: any = await RecommendationModel.find({
      usecase: this.usecase,
      amazon_account_id,
      cta_id: { $exists: true },
      inbound_received: false
    })
      .sort({
        created_at: -1,
        resolved: 1,
        recommended_units_to_ship: -1
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
          image: userAsin?.image,
          asin: userAsin?.asin
        }
      ];
    }
    return recommendations;
  };
}

const inboundLabelsLowFbaStockService =
  InboundLabelsLowFbaStockService.getInstance();

export { inboundLabelsLowFbaStockService, InboundLabelsLowFbaStockService };
