import { Schema } from 'mongoose';
import { schemaOptions } from './recommendations.schema';
import { IIntervalMailData } from './interval-mail.interfaces';

export const intervalMailSchema = new Schema<IIntervalMailData>(
  {
    user_id: {
      type: Schema.Types.ObjectId
    },
    amazon_account_id: {
      type: Schema.Types.ObjectId
    },
    interval: {
      type: []
    }
  },
  schemaOptions
);
