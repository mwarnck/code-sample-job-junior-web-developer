import { Types } from 'mongoose';

type TCreateMessageArgs = {
  recommendation: any;
  text: string;
  files: [];
  reply_required?: boolean;
  with_cta?: boolean;
  user: any;
};

type THasUnreadMessagesByUserArgs = {
  recommendation: any;
  userId: Types.ObjectId;
};

type TMarkAllMessagesAsReadArgs = {
  recommendation: any;
  userId: Types.ObjectId;
};

type TIsLastMessageFromAutomationUserAndReplyRequiredArgs = {
  recommendation: any;
};

export {
  TCreateMessageArgs,
  THasUnreadMessagesByUserArgs,
  TMarkAllMessagesAsReadArgs,
  TIsLastMessageFromAutomationUserAndReplyRequiredArgs
};
