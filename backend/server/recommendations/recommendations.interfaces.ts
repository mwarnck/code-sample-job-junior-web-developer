import { Model, QueryWithHelpers, Types } from 'mongoose';
import {
  GetRecommendationCountDataResult,
  HydratedRecommendationDoc,
  IRecommendationQueryParams,
  Resolver,
  UniversalStatus
} from './recommendations.types';
import { Request, Response } from 'express';
import { HydratedFbaMisplacedInventoryRecommendationDoc } from './usecases/fba_misplaced_inventory/fba_misplaced_inventory.types';
import {
  HydratedFbaMissingInboundRecommendationDoc,
  UpdateFbaMissingInboundItems
} from './usecases/fba_missing_inbound/fba_missing_inbound.types';
import { HydratedFbaMisplacedDamagedInventoryRecommendationDoc } from './usecases/fba_misplaced_damaged_inventory/fba_misplaced_damaged_inventory.types';
import { HydratedSizeChangeHigherFbaRecommendationDoc } from './usecases/size_change_higher_fba/size_change_higher_fba.types';
import { HydratedQuantityBundlesRecommendationDoc } from './usecases/quantity_bundles/quantity_bundles.types';
export interface IRecommendationData {
  usecase?: string; // TODO (REFACTOR:RECOMMENDATION): enum
  user_id?: Types.ObjectId;
  amazon_account_id?: Types.ObjectId;
  seen?: boolean;
  resolved?: boolean;
  resolved_status?: UniversalStatus;
  resolved_at?: Date;
  resolved_by_automation?: boolean;
  resolver?: Resolver;
  cta_id?: Types.ObjectId;
  messages?: Types.ObjectId[];
  created_at?: Date;
  updated_at?: Date;
}

export interface IRecommendationMethods {
  hasMessages(): boolean;
}

export interface IRecommendationModel
  extends Model<
    IRecommendationData,
    IRecommendationQueryHelpers,
    IRecommendationMethods,
    IRecommendationVirtuals
  > {
  getRecommendationCountData(
    amazon_account_id: Types.ObjectId
  ): GetRecommendationCountDataResult;
  getMaxCostsavingsAsArrByAmzAccId(amazon_account_id: string): Promise<any[]>;
  getMaxCostsavingsByUser(user: any): Promise<any[]>;
  findUnresolvedWithNoStatus(
    params: IRecommendationQueryParams
  ): Promise<HydratedRecommendationDoc[]>;
  findUnresolvedWithNotResolvedStatus(
    params: IRecommendationQueryParams
  ): Promise<HydratedRecommendationDoc[]>;

  // check recomendation for type
  isFbaMisplacedDamagedInventory(
    recommendation: HydratedRecommendationDoc
  ): recommendation is HydratedFbaMisplacedDamagedInventoryRecommendationDoc;
  isFbaMisplacedInventory(
    recommendation: HydratedRecommendationDoc
  ): recommendation is HydratedFbaMisplacedInventoryRecommendationDoc;
  isFbaMissingInbound(
    recommendation: HydratedRecommendationDoc
  ): recommendation is HydratedFbaMissingInboundRecommendationDoc;
  isSizeChangeHigherFba(
    recommendation: HydratedRecommendationDoc
  ): recommendation is HydratedSizeChangeHigherFbaRecommendationDoc;
  isQuantityBundles(
    recommendation: HydratedRecommendationDoc
  ): recommendation is HydratedQuantityBundlesRecommendationDoc;
}

export interface IRecommendationVirtuals {}

export interface IRecommendationQueryHelpers {
  byUserId(
    user_id: Types.ObjectId | string
  ): QueryWithHelpers<
    HydratedRecommendationDoc[],
    HydratedRecommendationDoc,
    IRecommendationQueryHelpers
  >;
  byAmazonAccountId(
    accountId: Types.ObjectId
  ): QueryWithHelpers<
    HydratedRecommendationDoc[],
    HydratedRecommendationDoc,
    IRecommendationQueryHelpers
  >;
  byUsecase(
    usecase: string
  ): QueryWithHelpers<
    HydratedRecommendationDoc[],
    HydratedRecommendationDoc,
    IRecommendationQueryHelpers
  >;
  byUsecases(
    usecases: string[]
  ): QueryWithHelpers<
    HydratedRecommendationDoc[],
    HydratedRecommendationDoc,
    IRecommendationQueryHelpers
  >;
}

export interface IPatchCaseReimbursementIdRequest extends Request {
  recommendation?: HydratedRecommendationDoc;
  body: {
    case_reimbursement_id: string;
  };
}

export interface PatchBundleSkuRequest extends Request {
  recommendation?: HydratedRecommendationDoc;
  body: {
    bundle_sku: any;
  };
}

export interface PatchMissingInboundRequest extends Request {
  recommendation?: HydratedRecommendationDoc;
  body: {
    items: any;
  };
}
export interface PatchSizeChangeHigherFbaConfirmWrongMeasurementRequest
  extends Request {
  recommendation?: HydratedRecommendationDoc;
}

export interface GetFbaMissingInboundPackingListRequest extends Request {
  recommendation?: HydratedRecommendationDoc;
  user?: any;
}

export interface IRecommendationController {
  // COMMAND
  patchCaseReimbursementId: (
    req: IPatchCaseReimbursementIdRequest,
    res: Response
  ) => Promise<void>;
  patchBundleSku: (req: PatchBundleSkuRequest, res: Response) => Promise<void>;
  patchMissingInbound: (
    req: PatchMissingInboundRequest,
    res: Response
  ) => Promise<void>;
  patchSizeChangeHigherFbaConfirmWrongMeasurement: (
    req: PatchSizeChangeHigherFbaConfirmWrongMeasurementRequest,
    res: Response
  ) => Promise<void>;

  // QUERY
  getRecommendations: (req: Request, res: Response) => Promise<void>;
  getToalCostsavings: (req: Request, res: Response) => Promise<void>;
  getFbaMissingInboundPackingList: (
    req: GetFbaMissingInboundPackingListRequest,
    res: Response
  ) => Promise<void>;
}

export interface IRecommendationService {}

export interface IRecommendationsAccessService {
  checkUserRecommendationsAccess: (
    user: any,
    amazon_account_id: string
  ) => Promise<boolean>;
  checkUserRecommendationUseCaseWriteAccess: (
    user: any,
    amazon_account_id: string,
    usecase: string
  ) => Promise<boolean>;
}

export interface IRecommendationsQueryService {}

export interface IRecommendationsCommandService {
  updateCaseReimbursementId: (
    recommendation: any,
    case_reimbursement_id: string
  ) => Promise<void>;
  updateBundleSku: (recommendation: any, bundle_sku: string) => Promise<void>;
  updateFbaMissingInbound: (
    recommendation: HydratedFbaMissingInboundRecommendationDoc,
    items: UpdateFbaMissingInboundItems[]
  ) => Promise<void>;
  updateSizeChangeHigherFbaConfirmWrongMeasurement: (
    recommendation: HydratedSizeChangeHigherFbaRecommendationDoc
  ) => Promise<void>;
}
