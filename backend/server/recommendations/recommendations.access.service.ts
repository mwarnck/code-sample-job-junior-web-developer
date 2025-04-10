import { BaseService } from '../config/base/base.service';
import {
  operations,
  permissionLayerKeys
} from '../user/sharing/model.permissions';
import { IRecommendationsAccessService } from './recommendations.interfaces';
import Toggle from '../toggles/toggles.model';

class RecommendationsAccessService
  extends BaseService
  implements IRecommendationsAccessService
{
  private static instance: RecommendationsAccessService;

  private constructor() {
    super();
  }

  static getInstance(): RecommendationsAccessService {
    if (!this.instance) {
      this.instance = new RecommendationsAccessService();
    }
    return this.instance;
  }

  /**
   * Checks if the user has access to recommendations for a specific Amazon account.
   */
  checkUserRecommendationsAccess = async (
    user: any,
    amazon_account_id: any
  ) => {
    // TODO: is amazon account paid
    if (user.checkAmazonAccountAccess(amazon_account_id)) {
      //  && user.isPaid
      return true;
    }

    const { sharedAccounts: allAccountsShared } = user.sharingObject;

    const hasRecommendationAccess = allAccountsShared.some(
      (shareAccount: any) =>
        `${shareAccount.amazon_account_id}` === `${amazon_account_id}` &&
        shareAccount.checkAccess(permissionLayerKeys.recommendations, [
          operations.write,
          operations.read
        ])
    );

    const hasRecommendationAutomatedAccess = allAccountsShared.some(
      (shareAccount: any) =>
        `${shareAccount.amazon_account_id}` === `${amazon_account_id}` &&
        shareAccount.checkAccess(
          permissionLayerKeys.recommendations_automated,
          [operations.write]
        )
    );

    return hasRecommendationAccess || hasRecommendationAutomatedAccess;
  };

  checkUserRecommendationUseCaseWriteAccess = async (
    user: any,
    amazon_account_id: any,
    usecase: any
  ) => {
    if (!user || !amazon_account_id || !usecase) {
      throw new Error('Missing required parameters');
    }

    if (user.checkAmazonAccountAccess(amazon_account_id)) {
      const toggle = await Toggle.findOne({
        toggle_name: usecase + '_trigger',
        amazon_account_id
      });
      // if toggle is active, user has no write access
      if (toggle && toggle.active) {
        return false;
      }

      return true;
    }

    const { sharedAccounts: allAccountsShared } = user.sharingObject;

    const hasRecommendationAccess = allAccountsShared.some(
      (shareAccount: any) =>
        `${shareAccount.amazon_account_id}` === `${amazon_account_id}` &&
        shareAccount.checkAccess(permissionLayerKeys.recommendations, [
          operations.write,
          operations.read
        ])
    );

    const hasRecommendationAutomatedAccess = allAccountsShared.some(
      (shareAccount: any) =>
        `${shareAccount.amazon_account_id}` === `${amazon_account_id}` &&
        shareAccount.checkAccess(
          permissionLayerKeys.recommendations_automated,
          [operations.write]
        )
    );

    return hasRecommendationAccess || hasRecommendationAutomatedAccess;
  };
}

const recommendationsAccessService = RecommendationsAccessService.getInstance();

export { recommendationsAccessService, RecommendationsAccessService };
