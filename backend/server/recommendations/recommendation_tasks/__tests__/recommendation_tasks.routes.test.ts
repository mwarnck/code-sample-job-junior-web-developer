require('../../../config/initializer');
const Mongoose = require('mongoose');
const supertest = require('supertest');
const { default: routing } = require('../../../config/routing');
const { default: expressService } = require('../../../config/lib/express');
import {
  operations,
  permissionLayerKeys
} from '../../../user/sharing/model.permissions';
const createSharingRelation = require('../../../../test/db/compositions/sharing');

describe('RecommendationTasksRoutes', () => {
  let userWithAmazonAccount: any = null;
  let userAutomation: any = null;

  let supertestRequest: any = null;

  beforeEach(async () => {
    ({
      userWithAmazonAccount: userWithAmazonAccount,
      userWithoutAccount: userAutomation
    } = await createSharingRelation({
      name: permissionLayerKeys.recommendations_automated,
      access: [operations.write],
      subTypes: ['automated_recommendations']
    }));

    const app = expressService.init(Mongoose.connection);
    routing.init(app);
    supertestRequest = supertest(app);
  });

  describe('GET /recommendations/tasks', () => {
    it('should return 401 if no bearer token is provided', async () => {
      const response = await supertestRequest
        .get(`/recommendations/tasks/count`)
        .set('Authorization', `Bearer <invalid>`);

      expect(response.status).toBe(401);
    });

    it('should return 200 if bearer token from normal user is provided', async () => {
      const response = await supertestRequest
        .get(`/recommendations/tasks/count`)
        .set('Authorization', `Bearer ${userWithAmazonAccount.bearer_token}`);

      expect(response.status).toBe(200);
    });

    it('should return 200 if bearer token from automation user is provided', async () => {
      const response = await supertestRequest
        .get(`/recommendations/tasks/count`)
        .set('Authorization', `Bearer ${userAutomation.bearer_token}`);

      expect(response.status).toBe(200);
    });
  });
});
