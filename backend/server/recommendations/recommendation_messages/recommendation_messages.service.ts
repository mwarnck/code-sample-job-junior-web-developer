const UserModel = require('../../user/user.model');
import { Types } from 'mongoose';
import { IRecommendationMessagesService } from './recommendation_messages.interfaces';
import {
  TCreateMessageArgs,
  THasUnreadMessagesByUserArgs,
  TIsLastMessageFromAutomationUserAndReplyRequiredArgs,
  TMarkAllMessagesAsReadArgs
} from './recommendation_messages.types';
import { USER_ROLES } from '../../user/customModules';
import { MessageModel } from '../../messages/messages.model';
const CtasModel = require('../../assistant/cta/cta.model');
// const config = require('../../config');
const RecommendationModel = require('../recommendations.model');

class RecommendationMessagesService implements IRecommendationMessagesService {
  constructor() {}

  createMessage = async ({
    recommendation,
    text,
    files,
    reply_required = true,
    user,
    with_cta = true
  }: TCreateMessageArgs) => {
    const isAutomationUser = user.isAutomationUser();
    let automationUser: InstanceType<typeof UserModel>;
    if (!isAutomationUser) {
      automationUser = await user.getAutomationUserOfAmazonAccount(
        recommendation.amazon_account_id
      );
      if (!automationUser) {
        throw new Error('Automation user not found');
      }
    }

    // if the sender is the automation then the receiver is the user_id of the recommendation
    const receiverId = isAutomationUser
      ? recommendation.user_id
      : automationUser._id;

    const messageCreated = await MessageModel.create({
      text,
      sender: user._id,
      receiver: receiverId,
      reply_required,
      files
    });
    recommendation.messages.push(messageCreated._id);
    await recommendation.save();

    // TEMPFIX: set all messages as seen for recommendation
    await this.markAllMessagesAsRead({
      recommendation,
      userId: recommendation.user_id
    });

    // create cta if not available
    // update status to recommend if sender is automation acc
    // update status to accepted if sender is not automation acc
    if (with_cta) {
      await CtasModel.findOrCreateMessageCta({
        user_id: recommendation.user_id,
        amazon_account_id: recommendation.amazon_account_id,
        group_type: `${recommendation.usecase}_message`,
        recommendation_id: recommendation._id,
        isSenderAutomationUser: isAutomationUser
      });
    }
    return recommendation.populate('messages');
  };

  hasUnreadMessagesByUser = async ({
    recommendation,
    userId
  }: THasUnreadMessagesByUserArgs): Promise<boolean> => {
    const unreadMessage = await MessageModel.findOne({
      _id: { $in: recommendation.messages },
      receiver: userId,
      seen: false
    });

    return !!unreadMessage;
  };

  markAllMessagesAsRead = async ({
    recommendation,
    userId
  }: TMarkAllMessagesAsReadArgs): Promise<any> => {
    const updatePromises = recommendation.messages.map(
      async (messageId: Types.ObjectId) => {
        const message = await MessageModel.findById(messageId);
        if (
          message &&
          message.receiver.equals(userId) &&
          message.seen === false
        ) {
          message.seen = true;
          return message.save();
        }
      }
    );

    await Promise.all(updatePromises);

    // Refetch and repopulate the recommendation to get updated messages
    const updatedRecommendation = await RecommendationModel.findById(
      recommendation.id
    ).populate('messages');
    return updatedRecommendation.messages;
  };

  isLastMessageFromAutomationUserAndReplyRequired = async ({
    recommendation
  }: TIsLastMessageFromAutomationUserAndReplyRequiredArgs): Promise<boolean> => {
    const automationUsers: InstanceType<typeof UserModel>[] =
      await UserModel.find({
        roles: { $in: [USER_ROLES.AUTOMATION_USER] }
      })
        .select({ _id: 1 })
        .lean();
    if (!automationUsers.length) {
      throw new Error('Automation user not found');
    }
    if (recommendation.messages.length === 0) {
      return false;
    }
    const lastMessageId =
      recommendation.messages[recommendation.messages.length - 1];
    if (!lastMessageId) {
      return false;
      // throw new Error('Last message not found');
    }
    const message = await MessageModel.findById(lastMessageId);
    if (!message) {
      return false;
      // throw new Error('Message not found');
    }

    const isAutomationUser =
      automationUsers.find(
        (automation_user: InstanceType<typeof UserModel>) => {
          return automation_user._id.toString() === message.sender.toString();
        }
      ) !== undefined;

    return isAutomationUser && message.reply_required;

    // const automationUser = await UserModel.findOne({
    //   username: config.automationAccount.username,
    //   email: config.automationAccount.email
    // });
    // if (!automationUser) {
    //   throw new Error('Automation user not found');
    // }

    // if (recommendation.messages.length === 0) {
    //   return false;
    // }

    // const lastMessageId =
    //   recommendation.messages[recommendation.messages.length - 1];
    // if (!lastMessageId) {
    //   return false;
    //   // throw new Error('Last message not found');
    // }
    // const message = await MessageModel.findById(lastMessageId);
    // if (!message) {
    //   return false;
    //   // throw new Error('Message not found');
    // }
    // return message.sender.equals(automationUser._id) && message.reply_required;
  };
}

export { RecommendationMessagesService };
