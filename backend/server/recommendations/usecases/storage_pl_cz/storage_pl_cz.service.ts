import { BaseService } from '../../../config/base/base.service';
import { RecommendationUseCases } from '../../recommendations.enums';
import { IStoragePLCZService } from './storage_pl_cz.interfaces';

class StoragePLCZService extends BaseService implements IStoragePLCZService {
  private static instance: StoragePLCZService;
  private usecase = RecommendationUseCases.STORAGE_PL_CZ;

  private constructor() {
    super();
  }

  static getInstance(): StoragePLCZService {
    if (!this.instance) {
      this.instance = new StoragePLCZService();
    }
    return this.instance;
  }
}

const storagePLCZService = StoragePLCZService.getInstance();

export { storagePLCZService, StoragePLCZService };
