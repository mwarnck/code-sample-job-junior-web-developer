import { BaseService } from '../../../config/base/base.service';
import { RecommendationUseCases } from '../../recommendations.enums';
import { ICustomerReturnsRefundsService } from './customer_returns_refunds.interfaces';

class CustomerReturnsRefundsService
  extends BaseService
  implements ICustomerReturnsRefundsService
{
  private static instance: CustomerReturnsRefundsService;
  private usecase = RecommendationUseCases.CUSTOMER_RETURNS_REFUNDS;

  private constructor() {
    super();
  }

  static getInstance(): CustomerReturnsRefundsService {
    if (!this.instance) {
      this.instance = new CustomerReturnsRefundsService();
    }
    return this.instance;
  }
}

const customerReturnsRefundService =
  CustomerReturnsRefundsService.getInstance();

export { customerReturnsRefundService, CustomerReturnsRefundsService };
