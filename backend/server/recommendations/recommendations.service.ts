import { BaseService } from '../config/base/base.service';
import { sharingRecommendationsAutomatedServiceInstance } from '../config/initializer';
import { IRecommendationService } from './recommendations.interfaces';
import Toggle from '../toggles/toggles.model';
import {
  recommendation_types,
  filter_config,
  recommendation_automated_types
} from './recommendations.constants';
import { RecommendationUseCases } from './recommendations.enums';
import { getUserAsin } from './helpers/get-user-asin.helper';
import { sortRecommendationsByMessages } from './helpers/sortRecommendationByMessages';
import {
  FbaMissingInboundService,
  fbaMissingInboundService
} from './usecases/fba_missing_inbound/fba_missing_inbound.service';
import {
  quantityBundlesService,
  QuantityBundlesService
} from './usecases/quantity_bundles/quantity_bundles.service';
import {
  fbaMisplacedDamagedInventoryService,
  FbaMisplacedDamagedInventoryService
} from './usecases/fba_misplaced_damaged_inventory/fba_misplaced_damaged_inventory.service';
import {
  productsBundlesService,
  ProductsBundlesService
} from './usecases/products_bundles/products_bundles.service';
import {
  sizeChangeHigherFbaService,
  SizeChangeHigherFbaService
} from './usecases/size_change_higher_fba/size_change_higher_fba.service';
import {
  inboundLabelsLowFbaStockService,
  InboundLabelsLowFbaStockService
} from './usecases/inbound_labels_low_fba_stock/inbound_labels_low_fba_stock.service';
import {
  productFeedbacksService,
  ProductFeedbacksService
} from './usecases/product_feedbacks/product_feedbacks.service';
import { ToggleNames } from '../toggles/toggles.enums';

const RecommendationModel = require('./recommendations.model');
const UserModel = require('../user/user.model');
const { USER_ROLES } = require('../user/customModules');

class RecommendationService
  extends BaseService
  implements IRecommendationService
{
  private static instance: RecommendationService;

  public fbaMisplacedDamagedInventoryService: FbaMisplacedDamagedInventoryService;
  public fbaMissingInboundService: FbaMissingInboundService;
  public inboundLabelsLowFbaStockService: InboundLabelsLowFbaStockService;
  public productFeedbacksService: ProductFeedbacksService;
  public productsBundlesService: ProductsBundlesService;
  public quantityBundlesService: QuantityBundlesService;
  public sizeChangeHigherFbaService: SizeChangeHigherFbaService;

  sharingRecommendationsAutomatedService: any;

  constructor({
    fbaMisplacedDamagedInventoryService,
    fbaMissingInboundService,
    inboundLabelsLowFbaStockService,
    productFeedbacksService,
    productsBundlesService,
    quantityBundlesService,
    sizeChangeHigherFbaService,
    sharingRecommendationsAutomatedService
  }: {
    fbaMisplacedDamagedInventoryService: FbaMisplacedDamagedInventoryService;
    fbaMissingInboundService: FbaMissingInboundService;
    inboundLabelsLowFbaStockService: InboundLabelsLowFbaStockService;
    productFeedbacksService: ProductFeedbacksService;
    productsBundlesService: ProductsBundlesService;
    quantityBundlesService: QuantityBundlesService;
    sizeChangeHigherFbaService: SizeChangeHigherFbaService;
    sharingRecommendationsAutomatedService: any;
  }) {
    super();

    this.fbaMisplacedDamagedInventoryService =
      fbaMisplacedDamagedInventoryService;
    this.fbaMissingInboundService = fbaMissingInboundService;
    this.inboundLabelsLowFbaStockService = inboundLabelsLowFbaStockService;
    this.productFeedbacksService = productFeedbacksService;
    this.productsBundlesService = productsBundlesService;
    this.quantityBundlesService = quantityBundlesService;
    this.sizeChangeHigherFbaService = sizeChangeHigherFbaService;
    this.sharingRecommendationsAutomatedService =
      sharingRecommendationsAutomatedService;
  }

  static getInstance(): RecommendationService {
    if (!this.instance) {
      this.instance = new RecommendationService({
        fbaMisplacedDamagedInventoryService,
        fbaMissingInboundService,
        inboundLabelsLowFbaStockService,
        productFeedbacksService,
        productsBundlesService,
        quantityBundlesService,
        sizeChangeHigherFbaService,
        sharingRecommendationsAutomatedService:
          sharingRecommendationsAutomatedServiceInstance
      });
    }
    return this.instance;
  }

  getRecommendationById = async (id: string, user: any) => {
    // FIXME (REFACTOR:RECOMMENDATION): business logik in recommendations service rein -> zukunftssicherer falls mal ne recommedation detail page gebaut wird für web und dort auch seen true gemacht werden muss
    const recommendation = await RecommendationModel.findByIdAndUpdate(
      id,
      { $set: { seen: true } },
      { new: true }
    );

    // @ts-ignore
    const amazonAccount = user.amazon_accounts.find(
      (acc: any) =>
        acc._id.toString() === recommendation.amazon_account_id.toString()
    );

    const byUsecaseSku: string =
      recommendation.usecase === RecommendationUseCases.FBA_MISSING_INBOUND
        ? recommendation.refund_by_skus[0].sku
        : recommendation.sku;

    const userAsin = await getUserAsin(
      recommendation,
      byUsecaseSku,
      amazonAccount
    );

    const recommendationWithAsin = {
      ...recommendation.toObject(),
      name: userAsin?.name,
      image: userAsin?.image,
      currency: amazonAccount?.default_marketplace?.currency
    };

    return recommendationWithAsin;
  };

  /**
   * Fetches recommendations based on the provided use case.
   * @async
   * @param {string} usecase - The specific use case to fetch recommendations for.
   * @param {Object} user - The user object.
   * @param {string} amazon_account_id - The ID of the Amazon account to fetch recommendations for.
   * @returns {Promise<Array<Object>|undefined>} Returns a list of recommendations or undefined if no recommendations are found.
   * @throws {Error} Throws an error if the use case is not handled.
   */
  getRecommendationsByUsecase = async (
    usecase: string,
    user: any,
    amazon_account_id: string
  ) => {
    const get_recommendations: any = {
      quantity_bundles: this.quantityBundlesService.getRecommendations,
      fba_missing_inbound: this.fbaMissingInboundService.getRecommendations,
      fba_misplaced_damaged_inventory:
        this.fbaMisplacedDamagedInventoryService.getRecommendations,
      products_bundles: this.productsBundlesService.getRecommendations,
      size_change_higher_fba:
        this.sizeChangeHigherFbaService.getRecommendations,
      inbound_labels_low_fba_stock:
        this.inboundLabelsLowFbaStockService.getRecommendations,
      product_feedbacks: this.productFeedbacksService.getRecommendations
    };

    let recommendations;
    if (usecase in get_recommendations) {
      recommendations = await get_recommendations[usecase](
        user,
        amazon_account_id
      );
    } else {
      throw new Error(`Use case '${usecase}' not handled`);
    }
    return recommendations;
  };

  /**
   * Determines if a given use case for an Amazon account is automated based on its toggle status.
   * @async
   * @param {string} amazon_account_id - The ID of the Amazon account to check for.
   * @throws {Error} Throws an error if the use case or Amazon account ID is missing.
   * @returns {Promise<boolean>} Returns true if the use case is automated for the specified Amazon account, otherwise false.
   */
  getIsAutomated = async (amazon_account_id: any) => {
    if (!amazon_account_id) {
      throw new Error('Missing parameters');
    }

    let isAutomated = false;
    const toggle = await Toggle.findOne({
      toggle_name: ToggleNames.AUTOMATED_RECOMMENDATIONS_TRIGGER,
      amazon_account_id
    });
    if (toggle && toggle?.active) {
      isAutomated = true;
    }
    return isAutomated;
  };

  /**
   * Retrieves recommendation data for a specified use case, taking into account feature flags and user permissions.
   * @async
   * @param {string} usecase - The specific use case to fetch recommendations for.
   * @param {Object} recommendationOwnerUser - The user object who owns the recommendation.
   * @param {string} amazon_account_id - The ID of the Amazon account associated with the recommendations.
   * @param {Object} user - The user object requesting the recommendations.
   * @returns {Promise<Object|null>} Returns an object containing recommendations data and automation status or `null` if access is not allowed.
   */
  getRecommendationData = async (
    usecase: string,
    recommendationOwnerUser: any,
    amazon_account_id: string,
    user: any
  ) => {
    if (user.isAutomationUser()) {
      // Check if user has permission to access the specified usecase
      const isUseCaseAllowed =
        this.sharingRecommendationsAutomatedService.checkUserHasUseCaseAccessWithRecommendationsAutomated(
          user,
          amazon_account_id,
          usecase
        );

      if (!isUseCaseAllowed) {
        return null;
      }

      let recommendationsForAutomationUser =
        await this.getRecommendationsByUsecase(
          usecase,
          recommendationOwnerUser,
          amazon_account_id
        );

      // Für den Automation user auch die gesamten potentiellen und realisierten Ersparnisse ermitteln ???

      if (usecase === 'size_change_higher_fba') {
        recommendationsForAutomationUser =
          recommendationsForAutomationUser.filter(
            (data: any) => data.confirm_wrong_measurement
          );
      }

      return {
        automated: true, // all recommmendations which the automation user sees are automated
        data: recommendationsForAutomationUser
      };
    }

    const recommendations = await this.getRecommendationsByUsecase(
      usecase,
      recommendationOwnerUser,
      amazon_account_id
    );

    return {
      automated:
        (await this.getIsAutomated(amazon_account_id)) &&
        recommendation_automated_types.includes(usecase),

      data: recommendations
    };
  };

  removeRecommendationDataIfUserIsNotPaid = async (
    isRecommendationOwnerUserPaid: boolean,
    recommendationsData: any
  ) => {
    if (!isRecommendationOwnerUserPaid) {
      return [];
    }
    return recommendationsData;
  };

  getRecommendationCountOfUsecase = async (
    usecase: any,
    recommendationsData: any
  ) => {
    let completedCount;
    if (usecase === 'inbound_labels_low_fba_stock') {
      completedCount = recommendationsData
        .filter((reco: any) => !reco.inbound_received)
        .filter((recommendation: any) => recommendation.resolved).length;
    } else {
      completedCount = recommendationsData?.filter(
        (recommendation: any) => recommendation.resolved
      ).length;
    }

    const totalCount = recommendationsData?.length;

    return {
      completed: completedCount,
      total: totalCount
    };
  };

  calculateSavingsForUsecase = async (
    usecase: any,
    recommendationsData: any
  ) => {
    let potential_savings = 0;
    let realized_savings = 0;
    if (recommendationsData) {
      for (const recommendation of recommendationsData) {
        if (usecase === 'fba_missing_inbound') {
          if (
            ![
              'done',
              'reimbursed',
              'rejected',
              'not_shipped',
              'expired',
              'stock_found',
              'not_interesting'
            ].includes(recommendation.resolved_status)
          ) {
            potential_savings += recommendation.refund_total;
          }
          if (recommendation.reimbursement_amount) {
            realized_savings += recommendation.reimbursement_amount;
          }
        }
        if (usecase === 'fba_misplaced_damaged_inventory') {
          if (
            !['done', 'not_interesting'].includes(
              recommendation.resolved_status
            )
          ) {
            // durch rules engine wahrscheinlich unabhängig vom resolved_status, da auf 0 gesetzt wenn erledigt ?
            potential_savings += recommendation.refunds.possible;
          }
          if (recommendation.refunds.reimbursed) {
            realized_savings += recommendation.refunds.reimbursed;
          }
        }
        if (usecase === 'products_bundles' || usecase === 'quantity_bundles') {
          if (
            ![
              // 'todo',
              'done',
              'already_done',
              'not_interesting'
            ].includes(recommendation.resolved_status)
          ) {
            potential_savings += recommendation.costsavings.min;
          }
          if (recommendation.realized_savings) {
            realized_savings += recommendation.realized_savings;
          }
        }
        if (usecase === 'size_change_higher_fba') {
          if (
            !['done', 'corrected', 'verified', 'not_interesting'].includes(
              recommendation.resolved_status
            )
          ) {
            potential_savings += recommendation.additional_fees.yearly;
          }
          if (recommendation.realized_savings) {
            realized_savings += recommendation.realized_savings;
          }
        }
      }
    } else {
      throw new Error(`No recommendations provided`);
    }
    const currency = recommendationsData?.[0]?.currency;
    return {
      potential: potential_savings,
      realized: realized_savings,
      currency
    };
  };

  withMessages = async ({
    recommendationsData,
    user,
    amazon_account_id
  }: {
    recommendationsData: any;
    user: any;
    amazon_account_id: string;
  }) => {
    for (const usecase in recommendationsData) {
      recommendationsData[usecase].data = await RecommendationModel.populate(
        recommendationsData[usecase].data,
        {
          path: 'messages',
          options: {
            sort: { created_at: -1 }
          }
        }
      );

      if (recommendationsData?.[usecase]?.automated) {
        for (const data of recommendationsData[usecase].data) {
          // check value if the last message is from one of our automation accounts
          data.is_last_message_from_automation = false;
          if (data.messages && data.messages.length > 0) {
            data.is_last_message_from_automation =
              await data.messages[0].isMessageFromAutomation();
          }
        }
        recommendationsData[usecase].data = await sortRecommendationsByMessages(
          recommendationsData[usecase].data,
          user,
          amazon_account_id
        );
      }
    }

    return recommendationsData;
  };

  filterRecommendations = async ({ recommendationsData, filter }: any) => {
    for (const usecase in recommendationsData) {
      if (filter === 'messages') {
        const automation_users = await UserModel.find({
          roles: { $in: USER_ROLES.AUTOMATION_USER }
        }).lean();
        const automation_user_ids = automation_users.map(
          (automation_user: any) => {
            return automation_user._id.toString();
          }
        );
        recommendationsData[usecase].data = recommendationsData[
          usecase
        ].data.filter(
          (data: any) =>
            data.messages?.length &&
            automation_user_ids.includes(
              data?.messages?.[0]?.sender.toString()
            ) &&
            data?.messages?.[0]?.reply_required
        );
      }
      if (filter === 'resolved') {
        recommendationsData[usecase].data = recommendationsData[
          usecase
        ].data.filter((data: any) =>
          filter_config[usecase].is_resolved_with_status.includes(
            data.resolved_status
          )
        );
      }
      if (filter === 'in_progress') {
        recommendationsData[usecase].data = recommendationsData[
          usecase
        ].data.filter((data: any) =>
          filter_config[usecase].is_in_progress_with_status.includes(
            data.resolved_status
          )
        );
      }
      if (filter === 'in_progress_by_automation') {
        recommendationsData[usecase].data = recommendationsData[
          usecase
        ].data.filter(
          (data: any) =>
            filter_config[usecase].is_in_progress_with_status.includes(
              data.resolved_status
            ) && data?.resolved_by_automation
        );
      }
      if (filter === 'resolved_by_automation') {
        recommendationsData[usecase].data = recommendationsData[
          usecase
        ].data.filter(
          (data: any) =>
            filter_config[usecase].is_resolved_with_status.includes(
              data.resolved_status
            ) && data?.resolved_by_automation
        );
      }
      if (filter === 'unresolved') {
        recommendationsData[usecase].data = recommendationsData[
          usecase
        ].data.filter((data: any) => !data.resolved);
      }
    }

    return recommendationsData;
  };

  /**
   * Generates recommendations data based on a specified use case or for all use cases.
   * @async
   * @param {string} usecaseName - The specific use case name or 'all' to fetch data for all use cases.
   * @param {Object} recommendationOwnerUser - The user object who owns the recommendation.
   * @param {string} amazon_account_id - The ID of the Amazon account associated with the recommendations.
   * @param {Object} user - The user object requesting the recommendations.
   * @returns {Promise<Object>} Returns an object containing recommendations data for the specified use case or all use cases.
   */
  generateRecommendationsData = async (
    usecaseName: any,
    recommendationOwnerUser: any,
    amazon_account_id: string,
    user: any,
    filter = null
  ) => {
    let recommendationsData: any = {};

    if (usecaseName === 'all') {
      for await (const usecase of recommendation_types) {
        const data = await this.getRecommendationData(
          usecase,
          recommendationOwnerUser,
          amazon_account_id,
          user
        );

        if (data) {
          recommendationsData[usecase] = data;
        }
      }
    } else {
      const data = await this.getRecommendationData(
        usecaseName,
        recommendationOwnerUser,
        amazon_account_id,
        user
      );

      if (data) {
        recommendationsData[usecaseName] = data;
      }
    }

    recommendationsData = await this.withMessages({
      recommendationsData,
      user,
      amazon_account_id
    });

    if (filter) {
      recommendationsData = await this.filterRecommendations({
        recommendationsData,
        filter
      });
    }
    for (const usecase in recommendationsData) {
      recommendationsData[usecase].savings =
        await this.calculateSavingsForUsecase(
          usecase,
          recommendationsData[usecase].data
        );
      recommendationsData[usecase].number_of_recommendations =
        await this.getRecommendationCountOfUsecase(
          usecase,
          recommendationsData[usecase].data
        );

      recommendationsData[usecase].data =
        await this.removeRecommendationDataIfUserIsNotPaid(
          recommendationOwnerUser.isPaid,
          recommendationsData[usecase].data
        );
    }

    return recommendationsData;
  };

  getRecommendations = async ({
    user,
    amazon_account_id,
    recommendationOwnerUser,
    usecase,
    filter
  }: {
    user: any;
    amazon_account_id: string;
    recommendationOwnerUser: any;
    usecase: string;
    filter: any;
  }) => {
    const recommendationsData = await this.generateRecommendationsData(
      usecase,
      recommendationOwnerUser,
      amazon_account_id,
      user,
      filter
    );

    return recommendationsData;
  };
}

const recommendationService = RecommendationService.getInstance();

export { recommendationService, RecommendationService };
