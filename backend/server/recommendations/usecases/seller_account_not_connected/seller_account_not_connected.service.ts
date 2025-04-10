import { BaseService } from '../../../config/base/base.service';
import { RecommendationUseCases } from '../../recommendations.enums';
import { ISellerAccountNotConnectedService } from './seller_account_not_connected.interfaces';

class SellerAccountNotConnectedService
  extends BaseService
  implements ISellerAccountNotConnectedService
{
  private static instance: SellerAccountNotConnectedService;
  private usecase = RecommendationUseCases.SELLER_ACCOUNT_NOT_CONNECTED;

  private constructor() {
    super();
  }

  static getInstance(): SellerAccountNotConnectedService {
    if (!this.instance) {
      this.instance = new SellerAccountNotConnectedService();
    }
    return this.instance;
  }
}

const sellerAccountNotConnectedService =
  SellerAccountNotConnectedService.getInstance();

export { sellerAccountNotConnectedService, SellerAccountNotConnectedService };
