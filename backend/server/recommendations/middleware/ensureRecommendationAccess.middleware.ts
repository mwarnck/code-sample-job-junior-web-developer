import type { Request, Response, NextFunction } from 'express';

import {
  Options,
  SOURCES
} from '../../config/lib/middleware/middleware.constants';
import { recommendationsAccessService } from '../recommendations.access.service';

/**
 * Middleware to ensure that a user has access to a specific recommendation.
 *
 * This middleware takes an options object that specifies the source (body or params) and the key where the Amazon account ID can be found in the request object.
 * It uses the RecommendationService to check if the user associated with the request has access to the recommendation with the specified Amazon account ID.
 * If the user does not have access, it responds with a 403 status code.
 * If an error occurs during the access check, it responds with a 500 status code.
 */
export const ensureRecommendationAccess = (options: Options) => {
  if (!options || !options.source || !options.key) {
    throw new Error('Options source and key are required.');
  }

  const { source, key } = options;

  if (!Object.values(SOURCES).includes(source)) {
    throw new Error(
      `Invalid source value. Allowed values are ${Object.values(SOURCES).join(
        ', '
      )}.`
    );
  }

  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    // @ts-ignore
    const amazonAccountId = req[source][key];
    if (!amazonAccountId) {
      return res.status(400).json({
        errors: [
          { msg: `The key ${key} is not provided in request ${source}.` }
        ]
      });
    }

    try {
      const hasAccess =
        await recommendationsAccessService.checkUserRecommendationsAccess(
          user,
          amazonAccountId
        );

      if (!hasAccess) {
        return res
          .status(403)
          .json({ errors: [{ msg: 'recommendations.noAccess' }] });
      }

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
