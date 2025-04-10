export const recommendationsConfig = {
  items: {
    initial_item_number: 20,
    load_more_value: 20
  }
  // automation_acc_id: '64b52e06f81a1ede5b910f36' // (FIXED) TODO [AMZ-2345]: entfernen
};

export const availableFilters = [
  'all',
  'messages',
  'resolved',
  'in_progress',
  'unresolved',
  'in_progress_by_automation',
  'resolved_by_automation'
];

export const betaUsecases = ['product_feedbacks'];
