import supertest, { Agent } from 'supertest';

const { user } = require('../../../../test/db');
const UserModel = require('../../../user/user.model');

import routing from '../../../config/routing/index';
import mongoose from 'mongoose';
const { default: expressService } = require('../../../config/lib/express');

/** @type {UserModel} */
let userWithAmazonAccount: InstanceType<typeof UserModel> = null;
/** @type {string} */
let userAmazonAccountId: string | null = null;
/** @type {UserModel} */
let anotherUserWithAmazonAccount: InstanceType<typeof UserModel> = null;

let supertestRequest: Agent;

beforeEach(async () => {
  userWithAmazonAccount = await new UserModel(user.withAmazonAccount());
  userAmazonAccountId = userWithAmazonAccount.amazon_accounts[0]._id;
  userWithAmazonAccount.roles = ['paid'];
  await userWithAmazonAccount.save();

  anotherUserWithAmazonAccount = await new UserModel(user.withAmazonAccount());
  anotherUserWithAmazonAccount.roles = ['paid'];
  await anotherUserWithAmazonAccount.save();

  const app = expressService.init(mongoose.connection);
  routing.init(app);
  supertestRequest = supertest(app);
});
describe('Recommendation Product Feedbacks', () => {
  describe('POST /recommendations/product-feedbacks/translate-comments/:amazon_account_id', () => {
    it('should return 401 if no bearer token is provided', async () => {
      const response = await supertestRequest
        .post(
          `/recommendations/product-feedbacks/translate-comments/${userAmazonAccountId}`
        )
        .set('Authorization', `Bearer <invalid>`);
      expect(response.status).toBe(401);
    });
    it('should return 422 if comments are not in req.body', async () => {
      const response = await supertestRequest
        .post(
          `/recommendations/product-feedbacks/translate-comments/${userAmazonAccountId}`
        )
        .set('Authorization', `Bearer ${userWithAmazonAccount.bearer_token}`);
      expect(response.status).toBe(422);
    });
    it('should return 200', async () => {
      const response = await supertestRequest
        .post(
          `/recommendations/product-feedbacks/translate-comments/${userAmazonAccountId}`
        )
        .set('Authorization', `Bearer ${userWithAmazonAccount.bearer_token}`)
        .send({ comments: [123123, 321321321] });
      expect(response.status).toBe(200);
    });
  });
});
