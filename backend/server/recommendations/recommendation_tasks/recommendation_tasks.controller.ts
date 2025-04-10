import {
  IGetTaskCountRequest,
  IGetTaskCountResponse,
  IRecommendationTasksController
} from './recommendation_tasks.interfaces';
import { RecommendationTasksService } from './recommendation_tasks.service';

class RecommendationTasksController implements IRecommendationTasksController {
  private recommendationTasksService: RecommendationTasksService;

  constructor(
    initializer: boolean,
    recommendationTasksService: RecommendationTasksService
  ) {
    if (initializer !== true) {
      throw new Error(
        "Please use the central place for instances '/server/config/initializer.js'. Do not use 'new' directly."
      );
    }
    this.recommendationTasksService = recommendationTasksService;
  }

  getTaskCount = async (
    req: IGetTaskCountRequest,
    res: IGetTaskCountResponse
  ): Promise<void> => {
    try {
      const user = req.user;
      const result = await this.recommendationTasksService.getTaskCount(user);
      res.status(200).json(result);
    } catch (error: any) {
      console.log(error);
      res
        .status(422)
        .json({ errors: [{ msg: `recommendations.${error.message}` }] });
    }
  };
}

export { RecommendationTasksController };
