const RecommendationModel = require('../../recommendations.model');
import UserModel from '../../../user/user.model';
import { MessageModel } from '../../../messages/messages.model';
import { Types, Document } from 'mongoose';

const { recommendations, user } = require('../../../../test/db');
const {
  recommendationMessagesServiceInstance
} = require('../../../config/initializer');
// const config = require('../../../config');

describe('RecommendationMessagesService', () => {
  let userWithAmazonAccount: InstanceType<typeof UserModel>;
  let userAutomation: InstanceType<typeof UserModel>;
  let amazonAccountId: Types.ObjectId | undefined;
  let messages: {
    sender: Types.ObjectId;
    receiver: Types.ObjectId;
    text: string;
  }[];
  let messagesSaved: Document[];
  let recommendationQuantityBundleSaved: InstanceType<
    typeof RecommendationModel
  >;

  beforeEach(async () => {
    const recommendationQuantityBundle = recommendations.quantityBundle();
    userWithAmazonAccount = await new UserModel(
      user.withAmazonAccount()
    ).save();
    userAutomation = await new UserModel(user.automation()).save();
    amazonAccountId = userWithAmazonAccount.amazon_accounts[0]._id;

    recommendationQuantityBundle.amazon_account_id = amazonAccountId;
    recommendationQuantityBundle.user_id = userWithAmazonAccount._id;

    messages = [
      {
        sender: userWithAmazonAccount._id,
        receiver: userAutomation._id,
        text: 'test'
      }
    ];
    messagesSaved = await MessageModel.insertMany(messages);

    recommendationQuantityBundle.messages = messagesSaved.map(
      (message: Document) => message._id
    );
    recommendationQuantityBundleSaved = await new RecommendationModel(
      recommendationQuantityBundle
    ).save();
  });

  describe('createMessage', () => {
    it('should throw an error when automation user is not found', async () => {
      try {
        await recommendationMessagesServiceInstance.createMessage({
          recommendation: recommendationQuantityBundleSaved,
          text: 'test',
          files: [],
          senderId: userWithAmazonAccount._id,
          user: userWithAmazonAccount
        });
      } catch (error: any) {
        expect(error.message).toBe('Automation user not found');
      }
    });

    it('should create a message', async () => {
      const message = {
        sender: userWithAmazonAccount._id,
        receiver: userAutomation._id,
        text: 'test'
      };

      jest
        // @ts-ignore
        .spyOn(userWithAmazonAccount, 'getAutomationUserOfAmazonAccount')
        .mockImplementation(() => {
          return userAutomation;
        });

      const recommendation =
        await recommendationMessagesServiceInstance.createMessage({
          recommendation: recommendationQuantityBundleSaved,
          text: message.text,
          files: [],
          senderId: message.sender,
          user: userWithAmazonAccount
        });
      expect(recommendation.messages[0]).toEqual(
        expect.objectContaining(message)
      );
    });
  });

  describe('markAllMessagesAsRead', () => {
    it('should mark all messages as read', async () => {
      const messages =
        await recommendationMessagesServiceInstance.markAllMessagesAsRead({
          recommendation: recommendationQuantityBundleSaved,
          userId: userAutomation._id
        });
      for (const message of messages) {
        expect(message.seen).toBe(true);
      }
    });
  });
});
