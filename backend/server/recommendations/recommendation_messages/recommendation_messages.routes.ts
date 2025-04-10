import { SOURCES } from '../../config/lib/middleware/middleware.constants';
import { handleValidationErrors } from '../../config/lib/middleware/validation/handleValidationErrors.middleware';
import { ensureSpecificRecommendationUseCaseWriteAccess } from '../middleware/ensureSpecificRecommendationUseCaseWriteAccess.middleware';
import { text } from './recommendation_messages.validation';

const express = require('express');
const { checkSchema } = require('express-validator');
const passport = require('../../user/user.passport');
const {
  recommendationMessagesControllerInstance
} = require('../../config/initializer');
const { recommendationId } = require('../recommendations.validation');

const router = express.Router();

/**
 * @swagger
 * /recommendations/{recommendation_id}/messages:
 *  post:
 *    summary: Create a new message for a recommendation
 *    tags: [Recommendations]
 *    description: Create a new message for a recommendation
 *    security:
 *     - bearerAuth: []
 *    parameters:
 *     - in: path
 *       name: recommendation_id
 *       required: true
 *       description: The recommendation ID
 *       schema:
 *         type: string
 */
router.post(
  '/:recommendation_id/messages',
  passport.authenticate('bearer', { session: false }),
  checkSchema({
    ...recommendationId.inParams,
    ...text.inBody
    // ...files.inBody
  }),
  handleValidationErrors,
  ensureSpecificRecommendationUseCaseWriteAccess({
    source: SOURCES.PARAMS,
    key: 'recommendation_id',
    force: true
  }),
  recommendationMessagesControllerInstance.createMessage
);

/**
 * @swagger
 * /recommendations/{recommendation_id}/messages/mark-all-as-read:
 *   patch:
 *     summary: Mark all messages as read for a specific recommendation
 *     tags: [Recommendations]
 *     description: Marks all messages of a specific recommendation as read for the logged-in user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recommendation_id
 *         required: true
 *         description: The recommendation ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully marked all messages as read for the recommendation.
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Recommendation not found
 */
router.patch(
  '/:recommendation_id/messages/mark-all-as-read',
  passport.authenticate('bearer', { session: false }),
  checkSchema({
    ...recommendationId.inParams
  }),
  handleValidationErrors,
  ensureSpecificRecommendationUseCaseWriteAccess({
    source: SOURCES.PARAMS,
    key: 'recommendation_id',
    force: true
  }),
  recommendationMessagesControllerInstance.markAllMessagesAsRead
);

export default router;
