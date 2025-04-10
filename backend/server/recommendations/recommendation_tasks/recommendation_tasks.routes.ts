import express from 'express';
const passport = require('../../user/user.passport');
const {
  recommendationTasksControllerInstance
} = require('../../config/initializer');

const router = express.Router();

/**
 * @swagger
 * /recommendations/tasks/count:
 *   get:
 *     summary: Get tasks count
 *     tags: [Recommendations]
 *     description: Get the total number of tasks for the user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The total number of tasks for the user
 *         content:
 *           application/json:
 *             schema:
 *              type: object
 */
router.get(
  '/count',
  passport.authenticate('bearer', { session: false }),
  recommendationTasksControllerInstance.getTaskCount
);

export default router;
