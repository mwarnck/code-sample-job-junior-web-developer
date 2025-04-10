import { Types } from 'mongoose';

export interface IIntervalMailData {
  user_id?: Types.ObjectId;
  amazon_account_id?: Types.ObjectId;
  interval?: [];
}
