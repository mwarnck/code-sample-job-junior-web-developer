import moment from 'moment';

import { recommendationProductFeedbacksService } from '../recommendation_product_feedbacks.service';
const { user } = require('../../../../test/db');
const UserModel = require('../../../user/user.model');
const getReviewsModel = require('../../../reviews/reviews.model');
const ReturnsModel = require('../../../returns/returns.model');

/** @type {UserModel} */
let userWithAmazonAccount: InstanceType<typeof UserModel> = null;
const ReviewsModel = getReviewsModel();

describe('Recommendation Product Feedbacks', () => {
  describe('getTranslatedComments', () => {
    it('should get comments of reviews + returns and translate them', async () => {
      userWithAmazonAccount = await new UserModel(
        user.withAmazonAccount()
      ).save();

      const reviews_data = {
        amazon_account_id: userWithAmazonAccount.amazon_accounts[0]._id,
        review_text: 'example text number 1',
        date: moment('2024.01.01', 'YYYY-MM-DD').toDate()
      };
      const reviews_doc = await new ReviewsModel(reviews_data);
      await reviews_doc.save();

      const returns_data = {
        amazon_account_id: userWithAmazonAccount.amazon_accounts[0]._id,
        customer_comments: 'example text number 2',
        return_date: moment('2024.02.02', 'YYYY-MM-DD').toDate()
      };
      const returns_doc = await new ReturnsModel(returns_data);
      await returns_doc.save();

      const userLanguage = 'de';

      const result =
        await recommendationProductFeedbacksService.getTranslatedComments(
          userLanguage,
          userWithAmazonAccount.amazon_accounts[0]._id,
          [
            {
              comment_id: reviews_doc._id,
              type: 'reviews'
            },
            {
              comment_id: returns_doc._id,
              type: 'returns'
            }
          ]
        );
      expect(result).toEqual(
        expect.arrayContaining([
          {
            comment: 'Beispieltext Nummer 1',
            date: moment('2024.01.01', 'YYYY-MM-DD').toDate(),
            type: 'reviews'
          },
          {
            comment: 'Beispieltext Nummer 2',
            date: moment('2024.02.02', 'YYYY-MM-DD').toDate(),
            type: 'returns'
          }
        ])
      );
    });
  });
});
