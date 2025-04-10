export enum Resolvers {
  AUTO = 'auto',
  MANUAL = 'manual',
  ONBOARDING = 'onboarding',
  INITIAL_SETUP = 'initial_setup'
}

export enum TranslatedLanguages {
  DE = 'de',
  EN = 'en'
}

// TODO (REFACTOR:RECOMMENDATION): check onboarding, check trial usecases if necessary or depreacted
export enum RecommendationUseCases {
  CUSTOMER_RETURNS_REFUNDS = 'customer_returns_refunds',
  DELETE_USER_WARNING_MAIL = 'delete_user_warning_mail',
  FBA_DAMAGED_INVENTORY = 'fba_damaged_inventory',
  FBA_DISPOSED_INVENTORY = 'fba_disposed_inventory',
  FBA_MISPLACED_DAMAGED_INVENTORY = 'fba_misplaced_damaged_inventory',
  FBA_MISPLACED_INVENTORY = 'fba_misplaced_inventory',
  FBA_MISSING_INBOUND = 'fba_missing_inbound',
  INBOUND_LABELS_LOW_FBA_STOCK = 'inbound_labels_low_fba_stock',
  PRODUCT_FEEDBACKS = 'product_feedbacks',
  PRODUCTS_BUNDLES = 'products_bundles',
  QUANTITY_BUNDLES = 'quantity_bundles',
  REDUCE_DIMENSIONS = 'reduce_dimensions',
  SELLER_ACCOUNT_NOT_CONNECTED = 'seller_account_not_connected',
  SETUP_AUTOMATION_NOT_FINISHED = 'setup_automation_not_finished',
  SIZE_CHANGE_HIGHER_FBA = 'size_change_higher_fba',
  STORAGE_PL_CZ = 'storage_pl_cz',
  USERINTENT_STATUS_EXPIRED = 'userintent_status_expired',
  AUTOMATION_MAIL_FIRST_CASE_RESOLVED = 'automation_mail_first_case_resolved',
  AUTOMATION_MAIL_FIRST_REIMBURSEMENT = 'automation_mail_first_reimbursement'
}

export enum UniversalStatuses {
  ACCEPTED = 'accepted',
  ALREADY_DONE = 'already_done',
  COMMERCIAL_INVOICE = 'commercial_invoice',
  CORRECTED = 'corrected',
  DISCONTINUED = 'discontinued',
  DONE = 'done',
  EXPIRED = 'expired',
  INVALID = 'invalid',
  NEVER_NOTIFY = 'never_notify',
  NOT_INTERESTING = 'not_interesting',
  NOT_SHIPPED = 'not_shipped',
  PROOF_OF_SERVICE = 'proof_of_service',
  REJECTED = 'rejected',
  REMIND_LATER = 'remind_later',
  REQUESTED = 'requested',
  REIMBURSED = 'reimbursed',
  SOLD_OUT = 'sold_out',
  STOCK_FOUND = 'stock_found',
  TODO = 'todo',
  VERIFIED = 'verified'
}

export enum AvailableFilters {
  ALL = 'all',
  MESSAGES = 'messages',
  RESOLVED = 'resolved',
  IN_PROGRESS = 'in_progress',
  UNRESOLVED = 'unresolved',
  IN_PROGRESS_BY_AUTOMATION = 'in_progress_by_automation',
  RESOLVED_BY_AUTOMATION = 'resolved_by_automation'
}

export enum WeightUnits {
  POUNDS = 'pounds',
  KILOGRAMS = 'kilograms'
}

export enum DimensionsUnits {
  INCHES = 'inches',
  CENTIMETERS = 'centimeters'
}
