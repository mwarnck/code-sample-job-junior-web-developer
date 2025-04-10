import { BaseService } from '../../../config/base/base.service';
import { RecommendationUseCases } from '../../recommendations.enums';
import { IReduceDimensionsService } from './reduce_dimensions.interfaces';

class ReduceDimensionsService
  extends BaseService
  implements IReduceDimensionsService
{
  private static instance: ReduceDimensionsService;
  private usecase = RecommendationUseCases.REDUCE_DIMENSIONS;

  private constructor() {
    super();
  }

  static getInstance(): ReduceDimensionsService {
    if (!this.instance) {
      this.instance = new ReduceDimensionsService();
    }
    return this.instance;
  }
}

const reduceDimensionsService = ReduceDimensionsService.getInstance();

export { reduceDimensionsService, ReduceDimensionsService };
