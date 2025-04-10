require('../../common/helpers/prototypes.helper');

export const universal_statuses: string[] = [
  'todo',
  'done',
  'already_done',
  'not_interesting',
  'invalid',
  'remind_later',
  'never_notify',
  'rejected',
  'not_shipped',
  'stock_found',
  'verified',
  'accepted',
  'requested',
  'sold_out',
  'discontinued',
  'reimbursed',
  'expired',
  'corrected',
  'commercial_invoice',
  'proof_of_service',
  'confirm_quantity'
];

export const recommendation_types: string[] = [
  'quantity_bundles',
  'fba_missing_inbound',
  'products_bundles',
  'fba_misplaced_damaged_inventory',
  'size_change_higher_fba',
  'inbound_labels_low_fba_stock',
  'product_feedbacks'
  // 'customer_returns_refunds'
];

// IMPORTANT: This have to be there because for checkin the access to an recommendation we have to check these names plus the isAutomated flag
export const recommendation_automated_types: string[] = [
  'fba_missing_inbound',
  'fba_misplaced_damaged_inventory',
  'size_change_higher_fba'
];

// TODO: delete old subtypes (misplaced_damaged, missing_inbound, size_change) after migration to new toggle and new sharing
export const automation_sharing_subtypes = [
  'automated_recommendations', // THATS THE ONLY VALUE THAT SHOULD BE IN THE SUBTYPES, but maybe there are some old values in the database, that have to verified first
  'fba_missing_inbound',
  'fba_misplaced_damaged_inventory',
  'size_change_higher_fba'
];

export const filter_config: any = {
  quantity_bundles: {
    is_resolved_with_status: ['done', 'already_done', 'not_interesting'],
    is_in_progress_with_status: ['todo']
  },
  fba_missing_inbound: {
    is_resolved_with_status: [
      'reimbursed',
      'rejected',
      'not_shipped',
      'expired',
      'stock_found',
      'not_interesting'
    ],
    is_in_progress_with_status: [
      'done',
      'commercial_invoice',
      'proof_of_service'
    ]
  },
  products_bundles: {
    is_resolved_with_status: ['done', 'already_done', 'not_interesting'],
    is_in_progress_with_status: ['todo']
  },
  fba_misplaced_damaged_inventory: {
    is_resolved_with_status: ['done', 'not_interesting'],
    is_in_progress_with_status: [],
    specials: ['reimbursed'],
    special_rules: {
      reimbursed: {
        status: 'done',
        detailed_status: 'done',
        reimbursed_items: { $gt: 0 }
      }
    }
  },
  size_change_higher_fba: {
    is_resolved_with_status: ['corrected', 'verified', 'not_interesting'],
    is_in_progress_with_status: ['done']
  },
  inbound_labels_low_fba_stock: {
    is_resolved_with_status: [
      'accepted',
      'already_done',
      'sold_out',
      'discontinued',
      'not_interesting'
    ],
    is_in_progress_with_status: []
  },
  product_feedbacks: {
    is_resolved_with_status: ['done', 'not_interesting'],
    is_in_progress_with_status: ['todo']
  }
};
