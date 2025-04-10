import express from 'express';
const router = express.Router();
import { checkSchema } from 'express-validator';
import { comments } from './recommendation_product_feedbacks.validation';
const passport = require('../../user/user.passport');
const {
  amazon_account_id
} = require('../../config/lib/middleware/validation/checkSchema.validations');
import { recommendationProductFeedbacksController } from './recommendation_product_feedbacks.controller';
const {
  ensureUserIsPaid
} = require('../../config/lib/middleware/user/ensureUserIsPaid.middleware');
const {
  handleValidationErrors
} = require('../../config/lib/middleware/validation/handleValidationErrors.middleware');

router.post(
  '/translate-comments/:amazon_account_id',
  passport.authenticate('bearer', { session: false }),
  ensureUserIsPaid,
  checkSchema({
    ...amazon_account_id.inParams,
    ...comments.inBody
  }),
  handleValidationErrors,
  recommendationProductFeedbacksController.getTranslatedComments
);

export default router;
