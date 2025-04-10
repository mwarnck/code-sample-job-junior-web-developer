import { BaseService } from '../../../config/base/base.service';
import { RecommendationUseCases } from '../../recommendations.enums';
import { IFbaMisplacedInventoryService } from './fba_misplaced_inventory.interfaces';

class FbaMisplacedInventoryService
  extends BaseService
  implements IFbaMisplacedInventoryService
{
  private static instance: FbaMisplacedInventoryService;
  private usecase = RecommendationUseCases.FBA_MISPLACED_INVENTORY;

  private constructor() {
    super();
  }

  static getInstance(): FbaMisplacedInventoryService {
    if (!this.instance) {
      this.instance = new FbaMisplacedInventoryService();
    }
    return this.instance;
  }
}

const fbaMisplacedInventoryService = FbaMisplacedInventoryService.getInstance();

export { fbaMisplacedInventoryService, FbaMisplacedInventoryService };
