import type { Request, Response, NextFunction } from 'express';

import {
  Options,
  SOURCES
} from '../../config/lib/middleware/middleware.constants';
import RecommendationModel from '../recommendations.model';
import { recommendationsAccessService } from '../recommendations.access.service';

/**
 * Middleware to ensure that a user has write access to a specific recommendation use case.
 *
 * This middleware takes an options object that specifies the source (body or params) and the key where the recommendation ID can be found in the request object.
 * It uses the RecommendationService to check if the user associated with the request has write access to the recommendation use case with the specified recommendation ID.
 * If the user does not have access, it responds with a 403 status code.
 * If an error occurs during the access check, it responds with a 500 status code.
 * If the recommendation is not found, it responds with a 404 status code.
 */
export const ensureSpecificRecommendationUseCaseWriteAccess = (
  options: Options
) => {
  if (!options || !options.source || !options.key) {
    throw new Error('Options source and key are required.');
  }

  const { source, key, force = false } = options;

  if (!Object.values(SOURCES).includes(source)) {
    throw new Error(
      `Invalid source value. Allowed values are ${Object.values(SOURCES).join(
        ', '
      )}.`
    );
  }

  return async function (req: Request, res: Response, next: NextFunction) {
    const user = req.user;

    // @ts-ignore
    const recommendationId = req[source][key];
    if (!recommendationId) {
      return res.status(400).json({
        errors: [
          { msg: `The key ${key} is not provided in request ${source}.` }
        ]
      });
    }

    try {
      const recommendation = await RecommendationModel.findOne({
        _id: recommendationId
      });

      if (!recommendation) {
        return res
          .status(404)
          .json({ errors: [{ msg: 'recommendations.notFound' }] });
      }

      const hasAccess =
        await recommendationsAccessService.checkUserRecommendationUseCaseWriteAccess(
          user,
          recommendation.amazon_account_id!.toString(),
          recommendation.usecase
        );
      if (!hasAccess && !force) {
        return res
          .status(403)
          .json({ errors: [{ msg: 'recommendations.noAccess' }] });
      }
      // Add the recommendation to the request object
      (req as any).recommendation = recommendation;
      next();
    } catch (error: any) {
      return res.status(500).json({
        errors: [
          { msg: 'recommendations.accessCheckFailed', details: error.message }
        ]
      });
    }
  };
};
