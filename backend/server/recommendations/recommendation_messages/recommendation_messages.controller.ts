import {
  IPatchMarkAllMessagesAsReadRequest,
  IPatchMarkAllMessagesAsReadResponse,
  IPostCreateMessageRequest,
  IPostCreateMessageResponse,
  IRecommendationMessagesController
} from './recommendation_messages.interfaces';
import { RecommendationMessagesService } from './recommendation_messages.service';

class RecommendationMessagesController
  implements IRecommendationMessagesController
{
  recommendationMessagesService: RecommendationMessagesService;

  constructor(
    initializer: boolean,
    recommendationMessagesService: RecommendationMessagesService
  ) {
    if (initializer !== true) {
      throw new Error(
        "Please use the central place for instances '/server/config/initializer.js'. Do not use 'new' directly."
      );
    }
    this.recommendationMessagesService = recommendationMessagesService;
  }

  // Wird jetzt im Service direkt gehandelt
  createMessage = async (
    req: IPostCreateMessageRequest,
    res: IPostCreateMessageResponse
  ) => {
    const { recommendation, body, user } = req;

    try {
      const messageCreated =
        await this.recommendationMessagesService.createMessage({
          recommendation,
          ...body,
          user
        });

      res.status(200).json({ data: messageCreated });
    } catch (error: any) {
      res
        .status(422)
        .json({ errors: [{ msg: `recommendations.${error.message}` }] });
    }
  };

  markAllMessagesAsRead = async (
    req: IPatchMarkAllMessagesAsReadRequest,
    res: IPatchMarkAllMessagesAsReadResponse
  ) => {
    try {
      const { recommendation, user } = req;
      const messages =
        await this.recommendationMessagesService.markAllMessagesAsRead({
          recommendation,
          userId: user._id
        });
      res.status(200).json({ data: messages });
    } catch (error: any) {
      res
        .status(422)
        .json({ errors: [{ msg: `recommendations.${error.message}` }] });
    }
  };
}

export { RecommendationMessagesController };
