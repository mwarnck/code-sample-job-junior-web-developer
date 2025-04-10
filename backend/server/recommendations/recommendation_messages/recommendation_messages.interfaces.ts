import { Request, Response } from 'express';
import {
  TCreateMessageArgs,
  THasUnreadMessagesByUserArgs,
  TIsLastMessageFromAutomationUserAndReplyRequiredArgs,
  TMarkAllMessagesAsReadArgs
} from './recommendation_messages.types';

interface IRecommendationMessagesController {
  createMessage(
    req: IPostCreateMessageRequest,
    res: IPostCreateMessageResponse
  ): Promise<void>;
  markAllMessagesAsRead(
    req: IPatchMarkAllMessagesAsReadRequest,
    res: IPatchMarkAllMessagesAsReadResponse
  ): Promise<void>;
}

interface IRecommendationMessagesService {
  createMessage({
    recommendation,
    text,
    files,
    reply_required,
    user
  }: TCreateMessageArgs): Promise<any>;
  hasUnreadMessagesByUser: ({
    recommendation,
    userId
  }: THasUnreadMessagesByUserArgs) => Promise<boolean>;
  markAllMessagesAsRead: ({
    recommendation,
    userId
  }: TMarkAllMessagesAsReadArgs) => Promise<any>;
  isLastMessageFromAutomationUserAndReplyRequired: ({
    recommendation
  }: TIsLastMessageFromAutomationUserAndReplyRequiredArgs) => Promise<boolean>;
}

interface IPostCreateMessageRequest extends Request {
  body: {
    files: [];
    reply_required: boolean;
    text: string;
  };
  recommendation: any;
  user: any;
}

interface IPostCreateMessageResponse extends Response {}

interface IPatchMarkAllMessagesAsReadRequest extends Request {
  user: any;
  recommendation: any;
}

interface IPatchMarkAllMessagesAsReadResponse extends Response {}

export {
  IRecommendationMessagesController,
  IRecommendationMessagesService,
  IPostCreateMessageRequest,
  IPostCreateMessageResponse,
  IPatchMarkAllMessagesAsReadRequest,
  IPatchMarkAllMessagesAsReadResponse
};
