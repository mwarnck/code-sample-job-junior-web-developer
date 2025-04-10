import { Types } from 'mongoose';
import { resolverValues } from '../assistant/cta/config';
import CtasModel from '../assistant/cta/cta.model';
import { BaseService } from '../config/base/base.service';
import { Resolvers, UniversalStatuses } from './recommendations.enums';
import { IRecommendationsCommandService } from './recommendations.interfaces';
import {
  HydratedFbaMissingInboundRecommendationDoc,
  UpdateFbaMissingInboundItems
} from './usecases/fba_missing_inbound/fba_missing_inbound.types';
import { HydratedSizeChangeHigherFbaRecommendationDoc } from './usecases/size_change_higher_fba/size_change_higher_fba.types';
import moment from 'moment-timezone';
import { recommendation_automated_types } from './recommendations.constants';

class RecommendationsCommandService
  extends BaseService
  implements IRecommendationsCommandService
{
  private static instance: RecommendationsCommandService;

  private constructor() {
    super();
  }

  static getInstance(): RecommendationsCommandService {
    if (!this.instance) {
      this.instance = new RecommendationsCommandService();
    }
    return this.instance;
  }

  public updateCtaStatusToAcceptForRecommendation = async ({
    _id,
    user_id,
    resolver
  }: {
    _id: Types.ObjectId;
    user_id: Types.ObjectId;
    resolver: string | undefined;
  }) => {
    const resolverToUpdate: any = {};

    if (resolver && Object.keys(resolverValues).includes(resolver)) {
      resolverToUpdate.resolver = resolver; // resolverToUpdate will be used to update the resolver field in CTA below, but only if needed
    }

    const cta = await CtasModel.find({
      user_id,
      'items.item_id': typeof _id === 'string' ? new Types.ObjectId(_id) : _id
    }).lean();
    if (cta.length === 1) {
      if (cta[0].items.length === 1) {
        await CtasModel.updateOne(
          { _id: cta[0]._id },
          {
            ...resolverToUpdate,
            'status.value': 'accepted'
          }
        );
      }
    }
  };

  updateStatus = async ({
    recommendation,
    isAutomated,
    resolved_status,
    resolverValue,
    user
  }: {
    recommendation: any;
    isAutomated: boolean;
    resolved_status: string;
    resolverValue?: string;
    user: any;
  }) => {
    if (
      isAutomated &&
      recommendation_automated_types.includes(recommendation.usecase)
    ) {
      recommendation.resolved_by_automation = true;
    }

    recommendation.resolved_status = resolved_status;
    recommendation.resolver = resolverValue ? resolverValue : 'manual';
    recommendation.resolved = true;
    recommendation.resolved_at = moment().format();
    if (recommendation.usecase === 'fba_misplaced_damaged_inventory') {
      if (resolved_status === 'done') {
        recommendation.items.open += recommendation.items.unreconciled;
        recommendation.items.unreconciled = 0;
      }
    }
    await this.updateCtaStatusToAcceptForRecommendation({
      _id: recommendation._id,
      user_id: user._id,
      resolver: resolverValue
    });
    return recommendation.save();
  };

  updateCaseReimbursementId = async (
    recommendation: any,
    case_reimbursement_id: string
  ) => {
    recommendation.case_id = case_reimbursement_id;
    await recommendation.save();
  };

  updateBundleSku = async (recommendation: any, bundle_sku: string) => {
    recommendation.bundle_sku = bundle_sku;
    await recommendation.save();
  };

  updateFbaMissingInbound = async (
    recommendation: HydratedFbaMissingInboundRecommendationDoc,
    items: UpdateFbaMissingInboundItems[]
  ) => {
    // update the quantity_send of the items
    recommendation.refund_by_skus = recommendation.refund_by_skus!.map(
      (item) => {
        const itemToUpdate = items.find(
          (i: UpdateFbaMissingInboundItems) => i.sku === item.sku
        );
        if (itemToUpdate) {
          item.quantity_send = itemToUpdate.quantity_send;
        }
        return item;
      }
    );
    // check if the recommendation is resolved, because amazon was correct with their quantity_received numbers
    const isAmazonCorrect = recommendation.refund_by_skus.every(
      (item) => item.quantity_send === item.quantity_received
    );
    if (isAmazonCorrect) {
      recommendation.resolved = true;
      recommendation.resolved_status = UniversalStatuses.NOT_SHIPPED;
      recommendation.resolver = Resolvers.MANUAL;
      recommendation.resolved_at = moment().toDate();
    }
    if (recommendation.cta_id) {
      await CtasModel.findByIdAndUpdate(
        { _id: recommendation.cta_id },
        { 'status.value': 'accepted' }
      );
    }

    await recommendation.save();
  };

  /**
   * update function for size change higher fba usecase when automated and wrong measurement confirmed by the user
   */
  updateSizeChangeHigherFbaConfirmWrongMeasurement = async (
    recommendation: HydratedSizeChangeHigherFbaRecommendationDoc
  ) => {
    recommendation.confirm_wrong_measurement = true;

    if (recommendation.cta_id) {
      await CtasModel.findByIdAndUpdate(
        { _id: recommendation.cta_id },
        { 'status.value': 'accepted' }
      );
    }

    await recommendation.save();
  };
}

const recommendationsCommandService =
  RecommendationsCommandService.getInstance();

export { recommendationsCommandService, RecommendationsCommandService };
