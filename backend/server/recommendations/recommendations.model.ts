import { model } from 'mongoose';
import { RecommendationSchema } from './recommendations.schema';
import {
  findUnresolvedWithNoStatus,
  findUnresolvedWithNotResolvedStatus,
  getMaxCostsavingsAsArrByAmzAccId,
  getMaxCostsavingsByUser,
  getRecommendationCountData
} from './recommendations.model.statics';
import {
  IRecommendationData,
  IRecommendationModel
} from './recommendations.interfaces';
import { RecommendationUseCases } from './recommendations.enums';
import { customerReturnsRefundsSchema } from './usecases/customer_returns_refunds/customer_returns_refunds.schema';
import { fbaDamagedInventorySchema } from './usecases/fba_damaged_inventory/fba_damaged_inventory.schema';
import { fbaDisposedInventorySchema } from './usecases/fba_disposed_inventory/fba_disposed_inventory.schema';
import { fbaMisplacedDamagedInventorySchema } from './usecases/fba_misplaced_damaged_inventory/fba_misplaced_damaged_inventory.schema';
import { fbaMisplacedInventorySchema } from './usecases/fba_misplaced_inventory/fba_misplaced_inventory.schema';
import { fbaMissingInboundSchema } from './usecases/fba_missing_inbound/fba_missing_inbound.schema';
import { inboundLabelsLowFbaStockSchema } from './usecases/inbound_labels_low_fba_stock/inbound_labels_low_fba_stock.schema';
import { productsBundlesSchema } from './usecases/products_bundles/products_bundles.schema';
import { quantityBundlesSchema } from './usecases/quantity_bundles/quantity_bundles.schema';
import { reduceDimensionsSchema } from './usecases/reduce_dimensions/reduce_dimensions.schema';
import { intervalMailSchema } from './interval-mail.schema';
import { sizeChangeHigherFBASchema } from './usecases/size_change_higher_fba/size_change_higher_fba.schema';
import { storagePLCZSchema } from './usecases/storage_pl_cz/storage_pl_cz.schema';
import { userintentStatusExpiredSchema } from './usecases/userintent_status_expired/userintent_status_expired.schema';
import { productFeedbacksSchema } from './usecases/product_feedbacks/product_feedbacks.schema';
import { HydratedFbaMissingInboundRecommendationDoc } from './usecases/fba_missing_inbound/fba_missing_inbound.types';
import { HydratedFbaMisplacedInventoryRecommendationDoc } from './usecases/fba_misplaced_inventory/fba_misplaced_inventory.types';
import { HydratedFbaMisplacedDamagedInventoryRecommendationDoc } from './usecases/fba_misplaced_damaged_inventory/fba_misplaced_damaged_inventory.types';
import { HydratedRecommendationDoc } from './recommendations.types';
import { HydratedSizeChangeHigherFbaRecommendationDoc } from './usecases/size_change_higher_fba/size_change_higher_fba.types';
import { HydratedQuantityBundlesRecommendationDoc } from './usecases/quantity_bundles/quantity_bundles.types';

// IMPORTANT: If we want to query on a field without specifically specifying the discriminator usecase in query
// we have to make sure that it is part of the main schema

// done: Can be marked done by auto and manual
// already_done: Can be marked only by manual --> means that the user marks it as already done before (i.e. recommended product bundle already exists)
// invalid: Can be marked invalid by auto and manual
// not_interesting: Can be marked not interesting only by manual

// Statics
RecommendationSchema.statics.getRecommendationCountData =
  getRecommendationCountData;
RecommendationSchema.statics.getMaxCostsavingsAsArrByAmzAccId =
  getMaxCostsavingsAsArrByAmzAccId;
RecommendationSchema.statics.getMaxCostsavingsByUser = getMaxCostsavingsByUser;
RecommendationSchema.statics.findUnresolvedWithNoStatus =
  findUnresolvedWithNoStatus;
RecommendationSchema.statics.findUnresolvedWithNotResolvedStatus =
  findUnresolvedWithNotResolvedStatus;

// check recomendation for type
RecommendationSchema.statics.isFbaMisplacedDamagedInventory = function (
  recommendation: HydratedRecommendationDoc
): recommendation is HydratedFbaMisplacedDamagedInventoryRecommendationDoc {
  return (
    recommendation.usecase ===
    RecommendationUseCases.FBA_MISPLACED_DAMAGED_INVENTORY
  );
};

RecommendationSchema.statics.isFbaMisplacedInventory = function (
  recommendation: HydratedRecommendationDoc
): recommendation is HydratedFbaMisplacedInventoryRecommendationDoc {
  return (
    recommendation.usecase === RecommendationUseCases.FBA_MISPLACED_INVENTORY
  );
};

RecommendationSchema.statics.isFbaMissingInbound = function (
  recommendation: HydratedRecommendationDoc
): recommendation is HydratedFbaMissingInboundRecommendationDoc {
  return recommendation.usecase === RecommendationUseCases.FBA_MISSING_INBOUND;
};

RecommendationSchema.statics.isSizeChangeHigherFba = function (
  recommendation: HydratedRecommendationDoc
): recommendation is HydratedSizeChangeHigherFbaRecommendationDoc {
  return (
    recommendation.usecase === RecommendationUseCases.SIZE_CHANGE_HIGHER_FBA
  );
};

RecommendationSchema.statics.isQuantityBundles = function (
  recommendation: HydratedRecommendationDoc
): recommendation is HydratedQuantityBundlesRecommendationDoc {
  return recommendation.usecase === RecommendationUseCases.QUANTITY_BUNDLES;
};

// Methods
RecommendationSchema.methods.hasMessages = function () {
  return this.messages.length > 0;
};

// Virtuals

// Hooks (pre, ...)

const RecommendationModel = model<IRecommendationData, IRecommendationModel>(
  'Recommendation',
  RecommendationSchema
);

// IMPORTANT Discriminators have to stay in the same file as the main model

export const CustomerReturnsRefundsRecommendationModel =
  RecommendationModel.discriminator(
    RecommendationUseCases.CUSTOMER_RETURNS_REFUNDS,
    customerReturnsRefundsSchema
  );

export const DeleteUserWarningMailRecommendationModel =
  RecommendationModel.discriminator(
    RecommendationUseCases.DELETE_USER_WARNING_MAIL,
    intervalMailSchema
  );

export const FbaDamagedInventoryRecommendationModel =
  RecommendationModel.discriminator(
    RecommendationUseCases.FBA_DAMAGED_INVENTORY,
    fbaDamagedInventorySchema
  );

export const FbaDisposedInventoryRecommendationModel =
  RecommendationModel.discriminator(
    RecommendationUseCases.FBA_DISPOSED_INVENTORY,
    fbaDisposedInventorySchema
  );

export const FbaMisplacedDamagedInventoryRecommendationModel =
  RecommendationModel.discriminator(
    RecommendationUseCases.FBA_MISPLACED_DAMAGED_INVENTORY,
    fbaMisplacedDamagedInventorySchema
  );

export const FbaMisplacedInventoryRecommendationModel =
  RecommendationModel.discriminator(
    RecommendationUseCases.FBA_MISPLACED_INVENTORY,
    fbaMisplacedInventorySchema
  );

export const FbaMissingInboundRecommendationModel =
  RecommendationModel.discriminator(
    RecommendationUseCases.FBA_MISSING_INBOUND,
    fbaMissingInboundSchema
  );

export const InboundLabelsLowFbaStockRecommendationModel =
  RecommendationModel.discriminator(
    RecommendationUseCases.INBOUND_LABELS_LOW_FBA_STOCK,
    inboundLabelsLowFbaStockSchema
  );

export const ProductFeedbacksRecommendationModel =
  RecommendationModel.discriminator(
    RecommendationUseCases.PRODUCT_FEEDBACKS,
    productFeedbacksSchema
  );

export const ProductsBundlesRecommendationModel =
  RecommendationModel.discriminator(
    RecommendationUseCases.PRODUCTS_BUNDLES,
    productsBundlesSchema
  );

export const QuantityBundlesRecommendationModel =
  RecommendationModel.discriminator(
    RecommendationUseCases.QUANTITY_BUNDLES,
    quantityBundlesSchema
  );

export const ReduceDimensionsRecommendationModel =
  RecommendationModel.discriminator(
    RecommendationUseCases.REDUCE_DIMENSIONS,
    reduceDimensionsSchema
  );

export const SellerAccountNotConnectedRecommendationModel =
  RecommendationModel.discriminator(
    RecommendationUseCases.SELLER_ACCOUNT_NOT_CONNECTED,
    intervalMailSchema
  );

export const SetupAutomationNotFinishedRecommendationModel =
  RecommendationModel.discriminator(
    RecommendationUseCases.SETUP_AUTOMATION_NOT_FINISHED,
    intervalMailSchema
  );

export const SizeChangeHigherFbaRecommendationModel =
  RecommendationModel.discriminator(
    RecommendationUseCases.SIZE_CHANGE_HIGHER_FBA,
    sizeChangeHigherFBASchema
  );

export const StoragePLCZRecommendationModel = RecommendationModel.discriminator(
  RecommendationUseCases.STORAGE_PL_CZ,
  storagePLCZSchema
);

export const UserintentStatusExpiredRecommendationModel =
  RecommendationModel.discriminator(
    RecommendationUseCases.USERINTENT_STATUS_EXPIRED,
    userintentStatusExpiredSchema
  );

export const AutomationMailFirstCaseResolvedRecommendationModel =
  RecommendationModel.discriminator(
    RecommendationUseCases.AUTOMATION_MAIL_FIRST_CASE_RESOLVED,
    intervalMailSchema
  );

export const AutomationMailFirstReimbursementRecommendationModel =
  RecommendationModel.discriminator(
    RecommendationUseCases.AUTOMATION_MAIL_FIRST_REIMBURSEMENT,
    intervalMailSchema
  );

// TODO (REFACTOR:RECOMMENDATION): remove after all require are changed to import
module.exports = RecommendationModel;

export default RecommendationModel;
