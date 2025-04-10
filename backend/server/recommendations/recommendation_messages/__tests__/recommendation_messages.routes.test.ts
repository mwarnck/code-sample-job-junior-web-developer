const Mongoose = require('mongoose');
const supertest = require('supertest');
const { default: routing } = require('../../../config/routing');
const { default: expressService } = require('../../../config/lib/express');
const RecommendationModel = require('../../recommendations.model');
const UserModel = require('../../../user/user.model');
const createSharingRelation = require('../../../../test/db/compositions/sharing');
const {
  permissionLayerKeys,
  operations
} = require('../../../user/sharing/model.permissions');

// const { user, recommendations } = require('../../../../test/db');
import { user, recommendations } from '../../../../test/db';
const { MessageModel } = require('../../../messages/messages.model');

describe('Recommendation Messages Routes', () => {
  let userWithAmazonAccount: any = null;
  let userAutomation: any = null;
  let anotherUserWithAmazonAccount: any = null;
  let recommendationQuantityBundleSaved: any = null;

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

    anotherUserWithAmazonAccount = await new UserModel(
      user.withAmazonAccount()
    ).save();

    const recommendationQuantityBundle = recommendations.quantityBundle();
    recommendationQuantityBundle.amazon_account_id =
      userWithAmazonAccount.amazon_accounts[0]._id;
    recommendationQuantityBundle.user_id = userWithAmazonAccount._id;

    const messages = [
      {
        sender: userWithAmazonAccount._id,
        receiver: userAutomation._id,
        text: 'test'
      }
    ];
    const messagesSaved = await MessageModel.insertMany(messages);

    recommendationQuantityBundle.messages = messagesSaved.map(
      (message: any) => message._id
    );
    recommendationQuantityBundleSaved = await new RecommendationModel(
      recommendationQuantityBundle
    ).save();

    const app = expressService.init(Mongoose.connection);
    routing.init(app);
    supertestRequest = supertest(app);
  });

  describe('POST /recommendations/:recommendation_id/messages', () => {
    it('should return 401 if no bearer token is provided', async () => {
      const recommendation_id = recommendationQuantityBundleSaved._id;
      const response = await supertestRequest
        .post(`/recommendations/${recommendation_id}/messages`)
        .set('Authorization', `Bearer <invalid>`);

      expect(response.status).toBe(401);
    });

    it.skip('should return 403 if user doesnt have access to the specified recommendation', async () => {
      const recommendation_id = recommendationQuantityBundleSaved._id;
      const response = await supertestRequest
        .post(`/recommendations/${recommendation_id}/messages`)
        .set(
          'Authorization',
          `Bearer ${anotherUserWithAmazonAccount.bearer_token}`
        )
        .send({ text: 'test' });

      expect(response.status).toBe(403);
    });

    it('should return 422 if the request body is invalid', async () => {
      const recommendation_id = recommendationQuantityBundleSaved._id;
      const response = await supertestRequest
        .post(`/recommendations/${recommendation_id}/messages`)
        .set('Authorization', `Bearer ${userWithAmazonAccount.bearer_token}`)
        .send({ text: '' });

      expect(response.status).toBe(422);
    });

    it('should return 200 if the request body is valid', async () => {
      const recommendation_id = recommendationQuantityBundleSaved._id;
      const response = await supertestRequest
        .post(`/recommendations/${recommendation_id}/messages`)
        .set('Authorization', `Bearer ${userWithAmazonAccount.bearer_token}`)
        .send({ text: 'test' });

      expect(response.status).toBe(200);
    });
  });

  describe('PATCH /recommendations/:recommendation_id/messages/mark-all-as-read', () => {
    it('should return 401 if no bearer token is provided', async () => {
      const recommendation_id = recommendationQuantityBundleSaved._id;
      const response = await supertestRequest
        .patch(
          `/recommendations/${recommendation_id}/messages/mark-all-as-read`
        )
        .set('Authorization', `Bearer <invalid>`);

      expect(response.status).toBe(401);
    });

    it.skip('should return 403 if user doesnt have access to the specified recommendation', async () => {
      const recommendation_id = recommendationQuantityBundleSaved._id;
      const response = await supertestRequest
        .patch(
          `/recommendations/${recommendation_id}/messages/mark-all-as-read`
        )
        .set(
          'Authorization',
          `Bearer ${anotherUserWithAmazonAccount.bearer_token}`
        );

      expect(response.status).toBe(403);
    });

    it('should return 200 if the request body is valid', async () => {
      const recommendation_id = recommendationQuantityBundleSaved._id;
      const response = await supertestRequest
        .patch(
          `/recommendations/${recommendation_id}/messages/mark-all-as-read`
        )
        .set('Authorization', `Bearer ${userWithAmazonAccount.bearer_token}`);

      expect(response.status).toBe(200);
    });
  });
});
