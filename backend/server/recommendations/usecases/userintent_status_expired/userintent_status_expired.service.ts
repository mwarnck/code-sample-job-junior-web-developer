import { BaseService } from '../../../config/base/base.service';
import { RecommendationUseCases } from '../../recommendations.enums';
import { IUserintentStatusExpiredService } from './userintent_status_expired.interfaces';

class UserintentStatusExpiredService
  extends BaseService
  implements IUserintentStatusExpiredService
{
  private static instance: UserintentStatusExpiredService;
  private usecase = RecommendationUseCases.USERINTENT_STATUS_EXPIRED;

  private constructor() {
    super();
  }

  static getInstance(): UserintentStatusExpiredService {
    if (!this.instance) {
      this.instance = new UserintentStatusExpiredService();
    }
    return this.instance;
  }
}

const userintentStatusExpiredService =
  UserintentStatusExpiredService.getInstance();

export { userintentStatusExpiredService, UserintentStatusExpiredService };
