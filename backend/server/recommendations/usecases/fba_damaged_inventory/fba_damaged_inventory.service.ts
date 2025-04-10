import { BaseService } from '../../../config/base/base.service';
import { RecommendationUseCases } from '../../recommendations.enums';
import { IFbaDamagedInventoryService } from './fba_damaged_inventory.interfaces';

class FbaDamagedInventoryService
  extends BaseService
  implements IFbaDamagedInventoryService
{
  private static instance: FbaDamagedInventoryService;
  private usecase = RecommendationUseCases.FBA_DAMAGED_INVENTORY;

  private constructor() {
    super();
  }

  static getInstance(): FbaDamagedInventoryService {
    if (!this.instance) {
      this.instance = new FbaDamagedInventoryService();
    }
    return this.instance;
  }
}

const fbaDamagedInventoryService = FbaDamagedInventoryService.getInstance();

export { fbaDamagedInventoryService, FbaDamagedInventoryService };
