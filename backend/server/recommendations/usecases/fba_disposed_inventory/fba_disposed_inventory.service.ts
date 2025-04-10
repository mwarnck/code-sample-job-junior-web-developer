import { BaseService } from '../../../config/base/base.service';
import { RecommendationUseCases } from '../../recommendations.enums';
import { IFbaDisposedInventoryService } from './fba_disposed_inventory.interfaces';

class FbaDisposedInventoryService
  extends BaseService
  implements IFbaDisposedInventoryService
{
  private static instance: FbaDisposedInventoryService;
  private usecase = RecommendationUseCases.FBA_DISPOSED_INVENTORY;

  private constructor() {
    super();
  }

  static getInstance(): FbaDisposedInventoryService {
    if (!this.instance) {
      this.instance = new FbaDisposedInventoryService();
    }
    return this.instance;
  }
}

const fbaDisposedInventoryService = FbaDisposedInventoryService.getInstance();

export { fbaDisposedInventoryService, FbaDisposedInventoryService };
