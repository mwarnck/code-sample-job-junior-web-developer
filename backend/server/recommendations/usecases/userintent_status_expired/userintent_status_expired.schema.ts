import { Schema } from 'mongoose';
import { schemaOptions } from '../../recommendations.schema';
import { IUserintentStatusExpiredData } from './userintent_status_expired.interfaces';

export const userintentStatusExpiredSchema =
  new Schema<IUserintentStatusExpiredData>(
    {
      userintent_id: {
        type: Schema.Types.ObjectId
      }
    },
    schemaOptions
  );
