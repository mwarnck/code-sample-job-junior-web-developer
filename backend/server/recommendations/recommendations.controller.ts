import { BaseController } from '../config/base/base.controller';
import {
  recommendationsAccessService,
  RecommendationsAccessService
} from './recommendations.access.service';
import {
  recommendationsCommandService,
  RecommendationsCommandService
} from './recommendations.command.service';
import {
  GetFbaMissingInboundPackingListRequest,
  IPatchCaseReimbursementIdRequest,
  IRecommendationController,
  PatchBundleSkuRequest,
  PatchMissingInboundRequest,
  PatchSizeChangeHigherFbaConfirmWrongMeasurementRequest
} from './recommendations.interfaces';
import {
  recommendationsQueryService,
  RecommendationsQueryService
} from './recommendations.query.service';
import {
  recommendationService,
  RecommendationService
} from './recommendations.service';
import {
  FbaMissingInboundService,
  fbaMissingInboundService
} from './usecases/fba_missing_inbound/fba_missing_inbound.service';
import { universal_statuses } from './recommendations.constants';
import { resolverValues } from '../assistant/cta/config';
import { Request, Response } from 'express';
import RecommendationModel from './recommendations.model';

const User = require('../user/user.model');

class RecommendationController
  extends BaseController<RecommendationService>
  implements IRecommendationController
{
  private static instance: RecommendationController;

  public recommendationsAccessService: RecommendationsAccessService;
  public recommendationsQueryService: RecommendationsQueryService;
  public recommendationsCommandService: RecommendationsCommandService;
  public fbaMissingInboundService: FbaMissingInboundService;

  constructor(
    service: RecommendationService,
    recommendationsAccessService: RecommendationsAccessService,
    recommendationsQueryService: RecommendationsQueryService,
    recommendationsCommandService: RecommendationsCommandService,
    fbaMissingInboundService: FbaMissingInboundService
  ) {
    super(service);

    this.recommendationsAccessService = recommendationsAccessService;
    this.recommendationsQueryService = recommendationsQueryService;
    this.recommendationsCommandService = recommendationsCommandService;

    this.fbaMissingInboundService = fbaMissingInboundService;
  }

  static getInstance(): RecommendationController {
    if (!this.instance) {
      this.instance = new RecommendationController(
        recommendationService,
        recommendationsAccessService,
        recommendationsQueryService,
        recommendationsCommandService,
        fbaMissingInboundService
      );
    }
    return this.instance;
  }

  getRecommendations = async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const amazon_account_id = req.params.amazon_account_id;
      const usecaseName = (req.query?.usecase as string) || 'all';
      const filter = req.query?.filter;

      const hasAccess =
        await this.recommendationsAccessService.checkUserRecommendationsAccess(
          user,
          amazon_account_id
        );
      if (!hasAccess) {
        res.status(200).json({ data: {} });
        return;
      }

      let recommendationOwnerUser;
      if (user.checkAmazonAccountAccess(amazon_account_id)) {
        recommendationOwnerUser = user;
      } else {
        recommendationOwnerUser = await User.findOne({
          'amazon_accounts._id': amazon_account_id
        });
      }
      if (!recommendationOwnerUser) {
        res.status(422).json({ errors: [{ msg: 'user.notFound' }] });
        return;
      }

      const recommendationsData = await this.service.getRecommendations({
        user,
        amazon_account_id,
        recommendationOwnerUser,
        usecase: usecaseName,
        filter
      });

      this.sendOkJSONResponse(res, { data: recommendationsData });
    } catch (error: any) {
      console.error(error);
      res
        .status(422)
        .json({ errors: [{ msg: `recommendations.${error.message}` }] });
    }
  };

  patchStatus = async (req: any, res: any) => {
    try {
      const { user, recommendation } = req;
      const { resolved_status, resolver } = req.body; // _id is the recommendation id also

      let resolverValue;
      if (Object.keys(resolverValues).includes(resolver)) {
        resolverValue = resolver;
      }

      if (!universal_statuses.includes(resolved_status)) {
        return res
          .status(404)
          .json({ errors: [{ msg: `recommendations.status-not-allowed` }] });
      }

      const isAutomated = await this.service.getIsAutomated(
        recommendation.amazon_account_id
      );

      await this.recommendationsCommandService.updateStatus({
        recommendation,
        isAutomated,
        resolved_status,
        resolverValue,
        user
      });

      this.sendOkJSONResponse(res, { data: recommendation });
    } catch (error: any) {
      return res
        .status(422)
        .json({ errors: [{ msg: `recommendations.${error.message}` }] });
    }
  };

  patchCaseReimbursementId = async (
    req: IPatchCaseReimbursementIdRequest,
    res: Response
  ) => {
    const { recommendation } = req;
    const { case_reimbursement_id } = req.body;

    await this.recommendationsCommandService.updateCaseReimbursementId(
      recommendation,
      case_reimbursement_id
    );

    this.sendOkJSONResponse(res, { data: recommendation });
  };

  patchBundleSku = async (req: PatchBundleSkuRequest, res: Response) => {
    const { recommendation } = req;
    const { bundle_sku } = req.body;

    await this.recommendationsCommandService.updateBundleSku(
      recommendation,
      bundle_sku
    );

    this.sendOkJSONResponse(res, { data: recommendation });
  };

  patchMissingInbound = async (
    req: PatchMissingInboundRequest,
    res: Response
  ) => {
    const { recommendation } = req;
    const { items } = req.body;

    if (!recommendation) {
      throw new Error('Recommendation not found');
    }

    if (RecommendationModel.isFbaMissingInbound(recommendation)) {
      await this.recommendationsCommandService.updateFbaMissingInbound(
        recommendation,
        items
      );

      this.sendOkJSONResponse(res, { data: recommendation });
    } else {
      throw new Error('Recommendation is not of type FBA Missing Inbound');
    }
  };

  patchSizeChangeHigherFbaConfirmWrongMeasurement = async (
    req: PatchSizeChangeHigherFbaConfirmWrongMeasurementRequest,
    res: Response
  ) => {
    const { recommendation } = req;

    if (!recommendation) {
      throw new Error('Recommendation not found');
    }

    if (RecommendationModel.isSizeChangeHigherFba(recommendation)) {
      await this.recommendationsCommandService.updateSizeChangeHigherFbaConfirmWrongMeasurement(
        recommendation
      );

      this.sendOkJSONResponse(res, { data: recommendation });
    } else {
      throw new Error('Recommendation is not of type Size Change Higher Fba');
    }
  };

  getToalCostsavings = async (req: Request, res: Response) => {
    const user = req.user;
    const totalSavings =
      await RecommendationModel.getMaxCostsavingsByUser(user);
    this.sendOkJSONResponse(res, { data: { savings: totalSavings } });
  };

  getFbaMissingInboundPackingList = async (
    req: GetFbaMissingInboundPackingListRequest,
    res: Response
  ) => {
    const { user, recommendation } = req;

    if (!recommendation) {
      throw new Error('Recommendation not found');
    }

    if (RecommendationModel.isFbaMissingInbound(recommendation)) {
      const packingListPDF =
        await this.fbaMissingInboundService.createPackingListForOneMissingInboundRecommendation(
          recommendation,
          user.language,
          false
        );
      // Send the PDF as a response
      res.set('Content-Type', 'application/pdf');
      res.set(
        'Content-Disposition',
        `attachment; filename=packingList_${recommendation.shipment_id}.pdf`
      );
      this.sendOkResponse(res, packingListPDF);
    } else {
      throw new Error('Recommendation is not of type FBA Missing Inbound');
    }
  };
}

const recommendationController = RecommendationController.getInstance();

export { recommendationController, RecommendationController };
