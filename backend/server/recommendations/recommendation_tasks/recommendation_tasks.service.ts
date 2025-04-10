import {
  TGetTaskCountUserArgs,
  TTaskCountForAmazonAccountResult,
  TTaskCountResult
} from './recommendation_tasks.types';

import { IRecommendationMessagesService } from '../recommendation_messages/recommendation_messages.interfaces';
import { IRecommendationTasksService } from './recommendation_tasks.interfaces';

import RecommendationModel from '../recommendations.model';
import {
  recommendation_automated_types,
  recommendation_types
} from '../recommendations.constants';

class RecommendationTasksService implements IRecommendationTasksService {
  public sharingRecommendationsAutomatedService: any;
  public recommendationMessagesService: IRecommendationMessagesService;

  constructor(
    initializer: boolean,
    sharingRecommendationsAutomatedService: any,
    recommendationMessagesService: IRecommendationMessagesService
  ) {
    if (initializer !== true) {
      throw new Error(
        "Please use the central place for instances '/server/config/initializer.js'. Do not use 'new' directly."
      );
    }

    this.sharingRecommendationsAutomatedService =
      sharingRecommendationsAutomatedService;
    this.recommendationMessagesService = recommendationMessagesService;
  }

  getTaskCountNewForNormalUser = async ({
    amazon_account_id,
    usecases
  }: Pick<
    TGetTaskCountUserArgs,
    'amazon_account_id' | 'usecases'
  >): Promise<number> => {
    // get all new recommendations for normal user where status is not set
    const recommendationsNew =
      await RecommendationModel.findUnresolvedWithNoStatus({
        amazon_account_id,
        usecases
      });

    return recommendationsNew.length;
  };

  getTaskCountOpenForNormalUser = async ({
    amazon_account_id,
    usecases
  }: Pick<
    TGetTaskCountUserArgs,
    'amazon_account_id' | 'usecases'
  >): Promise<number> => {
    // get all recommendations where status is not finished
    const recommmendationsOpen =
      await RecommendationModel.findUnresolvedWithNotResolvedStatus({
        amazon_account_id: amazon_account_id.toString(),
        usecases
      });

    const filteredRecommendations = await Promise.all(
      recommmendationsOpen.map(async (recommendation: any) => {
        let includeRecommendation = false;

        // check for unread messages by the receiver
        const hasUnreadMessagesByUser =
          await this.recommendationMessagesService.hasUnreadMessagesByUser({
            recommendation,
            userId: recommendation.user_id
          });
        if (hasUnreadMessagesByUser) {
          includeRecommendation = true;
        }

        // if last message is from automation user and reply is required -> user has to reply
        const isLastMessageFromAutomationUserAndReplyRequired =
          await this.recommendationMessagesService.isLastMessageFromAutomationUserAndReplyRequired(
            {
              recommendation
            }
          );
        if (isLastMessageFromAutomationUserAndReplyRequired) {
          includeRecommendation = true;
        }

        return includeRecommendation;
      })
    );

    const recommendationsOpenFilteredCount =
      filteredRecommendations.filter(Boolean).length;

    return recommendationsOpenFilteredCount;
  };

  getTaskCountNewForAutomationUser = async ({
    amazon_account_id,
    usecases
  }: Pick<
    TGetTaskCountUserArgs,
    'amazon_account_id' | 'usecases'
  >): Promise<number> => {
    // get all new recommendations for automation user where status is not set
    const recommendationsNew =
      await RecommendationModel.findUnresolvedWithNoStatus({
        amazon_account_id,
        usecases
      });

    const recommendationsNewFiltered = recommendationsNew.filter(
      (recommendation: any) =>
        recommendation_automated_types.includes(recommendation.usecase) &&
        (recommendation.usecase !== 'size_change_higher_fba' ||
          recommendation.confirm_wrong_measurement)
    );

    return recommendationsNewFiltered.length;
  };

  getTaskCountOpenForAutomationUser = async ({
    user,
    amazon_account_id,
    usecases
  }: Pick<
    TGetTaskCountUserArgs,
    'user' | 'amazon_account_id' | 'usecases'
  >): Promise<number> => {
    // console.log(
    //   'getTaskCountOpenForAutomationUser for amazon_account_id:' +
    //     amazon_account_id
    // );
    // get all recommendations where status is not finished
    const recommendationsOpen =
      await RecommendationModel.findUnresolvedWithNotResolvedStatus({
        amazon_account_id,
        usecases
      });
    let recommendationsOpenFilteredCount = 0;
    await Promise.all(
      recommendationsOpen.map(async (recommendation: any) => {
        let includeRecommendation =
          ['fba_missing_inbound', 'size_change_higher_fba'].includes(
            recommendation.usecase
          ) && recommendation.resolved_status === 'done';

        if (recommendation.messages.length) {
          // check for unread messages by the receiver
          const hasUnreadMessagesByUser =
            await this.recommendationMessagesService.hasUnreadMessagesByUser({
              recommendation,
              userId: user._id
            });
          if (hasUnreadMessagesByUser) {
            includeRecommendation = true;
          }

          // if last message is from automation user and reply is required -> user has to reply
          const isLastMessageFromAutomationUserAndReplyRequired =
            await this.recommendationMessagesService.isLastMessageFromAutomationUserAndReplyRequired(
              {
                recommendation
              }
            );
          if (isLastMessageFromAutomationUserAndReplyRequired) {
            includeRecommendation = true;
          }
        }

        if (includeRecommendation) {
          recommendationsOpenFilteredCount++;
        }
      })
    );

    return recommendationsOpenFilteredCount;
  };

  getTaskCountDataForAmazonAccount = async ({
    amazon_account_id,
    user
  }: Pick<
    TGetTaskCountUserArgs,
    'user' | 'amazon_account_id'
  >): Promise<TTaskCountForAmazonAccountResult | null> => {
    if (!user || !amazon_account_id) {
      throw new Error('Missing required parameters');
    }

    // console.log(
    //   'getTaskCountDataForAmazonAccount for amazon_account_id:' +
    //     amazon_account_id
    // );

    if (user.isAutomationUser()) {
      // check access
      const usecasesPossible: string[] = recommendation_automated_types;
      const usescasesAllowed: string[] = [];
      for (const usecase of usecasesPossible) {
        const result = user.hasRecommendationAccess({
          amazon_account_id,
          usecase
        });
        if (result) {
          usescasesAllowed.push(usecase);
        }
      }
      if (usescasesAllowed.length === 0) {
        return null;
      }

      const newTasksCount = await this.getTaskCountNewForAutomationUser({
        amazon_account_id,
        usecases: usescasesAllowed
      });
      const openTasksCount = await this.getTaskCountOpenForAutomationUser({
        user,
        amazon_account_id,
        usecases: usescasesAllowed
      });
      return {
        amazon_account_id: amazon_account_id.toString(),
        tasks: {
          newCount: newTasksCount,
          openCount: openTasksCount
        }
      };
    } else {
      if (!user.hasRecommendationAccess({ amazon_account_id })) {
        return null;
      }

      const newTasksCount = await this.getTaskCountNewForNormalUser({
        amazon_account_id,
        usecases: recommendation_types
      });
      const openTasksCount = await this.getTaskCountOpenForNormalUser({
        amazon_account_id,
        usecases: recommendation_types
      });
      return {
        amazon_account_id: amazon_account_id.toString(),
        tasks: {
          newCount: newTasksCount,
          openCount: openTasksCount
        }
      };
    }
  };

  getTaskCount = async (user: any): Promise<TTaskCountResult> => {
    if (!user) {
      throw new Error('Missing required parameters');
    }
    // console.log('getTaskCount for user ' + user.username);
    const ownAmazonAccountIds: string[] = user.amazon_accounts.map((acc: any) =>
      acc.id.toString()
    );
    const sharedAmazonAccountsReceiving =
      await user.getSharedAmazonAccountsReceiving();
    const sharedAmazonAccountsReceivingIds: string[] =
      sharedAmazonAccountsReceiving.map((acc: any) =>
        acc.amazon_account_id.toString()
      );

    const allAmazonAccountIds: string[] = ownAmazonAccountIds.concat(
      sharedAmazonAccountsReceivingIds
    );

    const data: TTaskCountForAmazonAccountResult[] = [];
    let metaNew = 0;
    let metaOpen = 0;
    await Promise.all(
      allAmazonAccountIds.map(async (amazon_account_id: string) => {
        const dataForTaskCount: TTaskCountForAmazonAccountResult | null =
          await this.getTaskCountDataForAmazonAccount({
            amazon_account_id,
            user
          });
        if (dataForTaskCount) {
          // console.log(
          //   'dataForTaskCount for amazon_account_id:' + amazon_account_id,
          //   dataForTaskCount
          // );
          data.push(dataForTaskCount);
          metaNew += dataForTaskCount.tasks.newCount;
          metaOpen += dataForTaskCount.tasks.openCount;
        }
      })
    );
    const meta = {
      newOverall: metaNew,
      openOverall: metaOpen
    };
    const returnData: TTaskCountResult = { data, meta };
    return returnData;
  };

  hasAccess = async (recommendation: any, user: any): Promise<boolean> => {
    console.log('hasAccess');
    console.log(recommendation);
    console.log(user);
    // TODO
    return true;
  };
}

export { RecommendationTasksService };
