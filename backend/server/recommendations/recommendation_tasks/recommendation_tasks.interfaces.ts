import { Request, Response } from 'express';
import {
  TTaskCountForAmazonAccountResult,
  TTaskCountResult,
  TGetTaskCountUserArgs
} from './recommendation_tasks.types';

interface IRecommendationTasksController {
  getTaskCount(
    req: IGetTaskCountRequest,
    res: IGetTaskCountResponse
  ): Promise<void>;
}

interface IRecommendationTasksService {
  /**
   * @description
   * just check if recommendation status is not set
   */
  getTaskCountNewForNormalUser(
    args: Pick<TGetTaskCountUserArgs, 'amazon_account_id' | 'usecases'>
  ): Promise<number>;
  /**
   * @description
   * check if status is not finshed, check if unread message from sender automation, check if unreplied message from sender automation
   */
  getTaskCountOpenForNormalUser(
    args: Pick<TGetTaskCountUserArgs, 'user' | 'amazon_account_id' | 'usecases'>
  ): Promise<number>;
  /**
   * just check if recommendation status is not set
   */
  getTaskCountNewForAutomationUser(
    args: Pick<TGetTaskCountUserArgs, 'amazon_account_id' | 'usecases'>
  ): Promise<number>;
  /**
   * check if status is not finshed, check if unread message from sender normal user, check if unreplied message from receiver normal user
   */
  getTaskCountOpenForAutomationUser(
    args: Pick<TGetTaskCountUserArgs, 'user' | 'amazon_account_id' | 'usecases'>
  ): Promise<number>;
  /**
   * @description
   * collect new and open tasks for all amazon accounts with allowed usecases
   */
  getTaskCountDataForAmazonAccount({
    amazon_account_id,
    user
  }: Pick<
    TGetTaskCountUserArgs,
    'user' | 'amazon_account_id'
  >): Promise<TTaskCountForAmazonAccountResult | null>;
  /**
   * @description
   * collect new and open tasks for all amazon accounts with allowed usecases
   */
  getTaskCount(user: any): Promise<TTaskCountResult>;
  hasAccess(recommendation: any, user: any): Promise<boolean>;
}

interface IGetTaskCountRequest extends Request {
  user: any;
}

interface IGetTaskCountResponse extends Response {}

export {
  IGetTaskCountRequest,
  IGetTaskCountResponse,
  IRecommendationTasksController,
  IRecommendationTasksService
};
