import express from 'express';
import { checkSchema } from 'express-validator';
import { ensureSpecificRecommendationUseCaseWriteAccess } from './middleware/ensureSpecificRecommendationUseCaseWriteAccess.middleware';
import { SOURCES } from '../config/lib/middleware/middleware.constants';
import { handleValidationErrors } from '../config/lib/middleware/validation/handleValidationErrors.middleware';
import {
  resolved_status,
  case_reimbursement_id,
  missing_inbound_items,
  bundle_sku,
  recommendationsGetAllValidationChain
} from './recommendations.validation';
import { resolver } from '../assistant/cta/cta.validation';
import { _id } from '../config/lib/middleware/validation/checkSchema.validations';
import { recommendationController } from './recommendations.controller';
import { asyncHandler } from '../config/asyncHandler';

const router = express.Router();
const passport = require('../user/user.passport');

/**
 * @openapi
 * /recommendations/get-all/{id}:
 *   get:
 *     summary: Retrieves all recommendations
 *     description: Retrieves all recommendations for the given Amazon account ID.
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Amazon account ID
 *         schema:
 *           type: string
 *       - name: usecase
 *         in: query
 *         required: false
 *         description: Specifies the usecase for the recommendation types.
 *         schema:
 *           type: string
 *           enum: ['all', 'quantity_bundles', 'fba_missing_inbound', 'products_bundles', 'fba_misplaced_damaged_inventory', 'size_change_higher_fba', 'inbound_labels_low_fba_stock']
 *     responses:
 *       '200':
 *         description: Successfully retrieved recommendations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Recommendation'
 *       '403':
 *         description: No access to recommendations or user is not paid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       '422':
 *         description: User not found or error in generating recommendations
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 */
router.get(
  '/get-all/:amazon_account_id',
  passport.authenticate('bearer', { session: false }),
  // ensureRecommendationAccess(), here not, because no access means return empty object
  recommendationsGetAllValidationChain,
  handleValidationErrors,
  recommendationController.getRecommendations
);

/**
 * @swagger
 * /recommendations/update-status:
 *   patch:
 *     summary: Update recommendation status
 *     description: Update the status of a recommendation
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: body
 *         name: recommendation
 *         description: The ID of the recommendation to update
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - _id
 *             - resolved_status
 *           properties:
 *             _id:
 *               type: string
 *               format: ObjectId
 *               description: The ID of the recommendation to update
 *             resolved_status:
 *               type: string
 *               description: The new resolved status
 *     responses:
 *       200:
 *         description: Recommendation status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Recommendation'
 *       403:
 *         description: No access to this recommendation
 *       404:
 *         description: Recommendation not found
 *       422:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.patch(
  '/update-status', // TODO: modify to restful route
  passport.authenticate('bearer', { session: false }),
  checkSchema({
    ..._id.inBody,
    ...resolved_status.inBody,
    ...resolver.inBody
  }),
  handleValidationErrors,
  ensureSpecificRecommendationUseCaseWriteAccess({
    source: SOURCES.BODY,
    key: '_id'
  }),
  recommendationController.patchStatus
);

/**
 * @swagger
 * /recommendations/update-case-reimbursement-id:
 *   patch:
 *     summary: Update recommendation case reimbursement ID
 *     description: Update the case reimbursement ID of a recommendation
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: body
 *         name: recommendation
 *         description: The ID of the recommendation to update
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - _id
 *             - case_reimbursement_id
 *           properties:
 *             _id:
 *               type: string
 *               format: ObjectId
 *               description: The ID of the recommendation to update
 *             case_reimbursement_id:
 *               type: string
 *               description: The new case reimbursement ID
 *     responses:
 *       200:
 *         description: Recommendation case reimbursement ID updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Recommendation'
 *       403:
 *         description: No access to this recommendation
 *       404:
 *         description: Recommendation not found
 *       422:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.patch(
  '/update-case-reimbursement-id',
  passport.authenticate('bearer', { session: false }),
  checkSchema({
    ..._id.inBody,
    ...case_reimbursement_id.inBody
  }),
  handleValidationErrors,
  ensureSpecificRecommendationUseCaseWriteAccess({
    source: SOURCES.BODY,
    key: '_id'
  }),
  asyncHandler(recommendationController.patchCaseReimbursementId)
);

router.patch(
  '/update-bundle-sku',
  passport.authenticate('bearer', { session: false }),
  checkSchema({
    ..._id.inBody,
    ...bundle_sku.inBody
  }),
  handleValidationErrors,
  ensureSpecificRecommendationUseCaseWriteAccess({
    source: SOURCES.BODY,
    key: '_id'
  }),
  asyncHandler(recommendationController.patchBundleSku)
);

router.patch(
  '/update-missing-inbound',
  passport.authenticate('bearer', { session: false }),
  checkSchema({
    ..._id.inBody,
    ...missing_inbound_items.inBody
  }),
  handleValidationErrors,
  ensureSpecificRecommendationUseCaseWriteAccess({
    source: SOURCES.BODY,
    key: '_id',
    force: true
  }),
  asyncHandler(recommendationController.patchMissingInbound)
);

router.patch(
  '/size-change-higher-confirm-wrong-measurement',
  passport.authenticate('bearer', { session: false }),
  checkSchema({
    ..._id.inBody
  }),
  handleValidationErrors,
  ensureSpecificRecommendationUseCaseWriteAccess({
    source: SOURCES.BODY,
    key: '_id',
    force: true
  }),
  asyncHandler(
    recommendationController.patchSizeChangeHigherFbaConfirmWrongMeasurement
  )
);

/**
 * @swagger
 * /recommendations/total-costsavings:
 *   get:
 *     summary: Get total cost savings
 *     description: Get the total cost savings of the user
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Total cost savings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     savings:
 *                       type: number
 *                       description: The total cost savings of the user
 *       403:
 *         description: No access to this resource
 *       404:
 *         description: Resource not found
 *       422:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.get(
  '/total-costsavings',
  passport.authenticate('bearer', { session: false }),
  asyncHandler(recommendationController.getToalCostsavings)
);

router.get(
  '/:recommendation_id/generate-packing-list',
  passport.authenticate('bearer', { session: false }),
  ensureSpecificRecommendationUseCaseWriteAccess({
    source: SOURCES.PARAMS,
    key: 'recommendation_id',
    force: true
  }),
  asyncHandler(recommendationController.getFbaMissingInboundPackingList)
);

export default router;
