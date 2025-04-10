import { BaseService } from '../config/base/base.service';
import { IRecommendationsQueryService } from './recommendations.interfaces';
import { Types } from 'mongoose';
import Toggle from '../toggles/toggles.model';

const RecommendationModel = require('./recommendations.model');
class RecommendationsQueryService
  extends BaseService
  implements IRecommendationsQueryService
{
  private static instance: RecommendationsQueryService;

  private constructor() {
    super();
  }

  static getInstance(): RecommendationsQueryService {
    if (!this.instance) {
      this.instance = new RecommendationsQueryService();
    }
    return this.instance;
  }

  getDataByMetric(metric: string) {
    function validateAmazonAccountId(
      amazon_account_id: Types.ObjectId,
      metric: string
    ) {
      if (!amazon_account_id) {
        throw new Error(
          `amazon account id is required by recommendationsQueryService.getDataByMetric.${metric}`
        );
      }
    }

    const dataByMetric: any = {
      'costsavings.overall': (amazon_account_id: Types.ObjectId) => {
        validateAmazonAccountId(amazon_account_id, metric);
        return RecommendationModel.getMaxCostsavingsAsArrByAmzAccId(
          amazon_account_id
        );
      },
      'timesavings.overall': (amazon_account_id: any) => {
        validateAmazonAccountId(amazon_account_id, metric);
        return Toggle.getTimeSavingsReviewsTrigger(amazon_account_id);
      },
      'recommendations.overall': async (amazon_account_id: Types.ObjectId) => {
        validateAmazonAccountId(amazon_account_id, metric);
        const recommendations =
          await RecommendationModel.getRecommendationCountData({
            amazon_account_id
          });
        return [recommendations.all];
      },
      'recommendations.resolved.overall': async (amazon_account_id: any) => {
        validateAmazonAccountId(amazon_account_id, metric);
        const recommendations =
          await RecommendationModel.getRecommendationCountData({
            amazon_account_id
          });
        return [recommendations.resolved];
      }
    };

    return dataByMetric[metric];
  }
}

const recommendationsQueryService = RecommendationsQueryService.getInstance();

export { recommendationsQueryService, RecommendationsQueryService };
