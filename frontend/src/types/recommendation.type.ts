import type { supportedCurrencies } from '@/lib/constants/supported-currencies.constant';
import { z } from 'zod';

export interface Recommendations {
  fba_misplaced_damaged_inventory?: FbaMisplacedDamagedInventoryRecommendation[];
  fba_missing_inbounds?: FbaMissingInboundRecommendation[];
  products_bundles?: ProductBundleRecommendation[];
  quantity_bundles?: QuantityBundleRecommendation[];
  size_change_higher_fba?: SizeChangeHigherFbaRecommendation[];
  inbound_labels_low_fba_stock: InboundLabelsLowFbaStockRecommendation[];
}

export interface InboundLabelsLowFbaStockRecommendation extends Recommendation {
  currency: (typeof supportedCurrencies)[number];
  fba_stock: number;
  image: string;
  name: string;
  recommended_units_to_ship: number;
  resolved: boolean;
  seen: boolean;
  sku: string;
  units: number;
  units_forecast: number;
  resolved_status?: string;
  available_units: number;
  open_quantity: number;
  country_code: string;
  inventory_date: string;
  inbound_received: boolean;
}
export interface ProductFeedbacksRecommendation extends Recommendation {
  currency: (typeof supportedCurrencies)[number];
  resolved: boolean;
  seen: boolean;
  resolved_status?: string;
  messages?: Message[];
  orders_count: number;
  reason_list: {
    reason: string;
    comments: { comment: string; type: 'returns' | 'reviews' }[];
    action?: string;
  }[];
  return_period_end: Date;
  return_period_start: Date;
  returns_percentage: number;
  translated_language: 'de' | 'en';
}

export interface IToggles {
  reviews_trigger: IReviewsTrigger[];
  inbound_labels_trigger: IInboundLabelsTrigger[];
}

export interface Recommendation {
  _id: string;
  amazon_account_id: string;
  is_last_message_from_automation?: boolean;
  cta_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  usecase: string;
  name: string;
  image: string;
  sku: string;
  asin: string;
  yearly_savings: number;
  messages?: Message[];
}

export interface SizeChangeHigherFbaRecommendation extends Recommendation {
  additional_fees: {
    average_per_unit: number;
    monthly: number;
    yearly: number;
  };
  after: {
    dimensions: {
      width: number;
      height: number;
      length: number;
      unit: (typeof supportedDimensionsUnits)[number];
    };
    weight: {
      weight: number;
      unit: (typeof supportedWeightUnits)[number];
    };
  };
  asin: string;
  before: {
    dimensions: {
      height: number;
      length: number;
      unit: (typeof supportedDimensionsUnits)[number];
      width: number;
    };
    weight: {
      unit: (typeof supportedWeightUnits)[number];
      weight: number;
    };
  };
  changed_at: string;
  currency: (typeof supportedCurrencies)[number];
  image: string;
  name: string;
  resolved: boolean;
  resolved_status: string;
  resolver: string;
  seen: boolean;
  sku: string;
  usecase: string;
  cta_id: string;
  realized_savings: number;
  orders_since_corrected: number;
  average_saving_per_order: number;
  confirm_wrong_measurement?: boolean;
  case_id: string;
}

export interface FbaMisplacedDamagedInventoryRecommendation extends Recommendation {
  asin: string;
  currency: (typeof supportedCurrencies)[number];
  fnsku: string;
  image: string;
  name: string;
  title: string;
  resolved: boolean;
  resolved_quantity: number;
  unresolved_quantity: number;
  unresolved_refund_total: number;
  resolved_status: string;
  sku: string;
  user_id: string;
  cta_id: string;
  refunds: { possible: number; reimbursed: number; possible_per_item: number };
  messages?: Message[];
  is_last_message_from_automation: boolean;
  items: {
    unreconciled: number;
    open: number;
    reimbursed: number;
    stock_found: number;
    rejected: number;
    reference_ids: string[];
  };
}

// export interface IFbaMisplacedInventory extends Recommendation {
//   adjusted_date: string;
//   cta_id: string;
//   fnsku: string;
//   misplaced_items_quantity: number;
//   reconciled_quantity: number;
//   reference_id: string;
//   refund_total: number;
//   resolved: boolean;
//   resolved_status: string;
//   resolver: string;
//   seen: boolean;
//   sku: string;
//   title: string;
//   unreconciled_quantity: number;
//   usecase: string;
//   reimbursement_id?: string;
//   products?: Product[];
// }

// export interface IFbaDamagedInventory extends Recommendation {
//   sku: string;
//   fnsku: string;
//   adjusted_date: string;
//   damaged_items_quantity: number;
//   unreconciled_quantity: number;
//   reconciled_quantity: number;
//   refund_total: number;
//   usecase: string;
//   seen: boolean;
//   resolved: boolean;
//   reference_id: string;
//   title: string;
//   cta_id: string;
//   reimbursement_id?: string;
//   products?: Product[];
// }

export interface FbaMissingInboundRecommendation extends Recommendation {
  cta_id: string;
  currency: (typeof supportedCurrencies)[number];
  missings_total: number;
  refund_by_skus: IRefundBySkus[];
  refund_total: number;
  resolved: boolean;
  resolved_status: string;
  resolver: string;
  seen: boolean;
  shipment_id: string;
  shipment_date: string;
  usecase: string;
  quantity: number;
  case_id: string;
  reimbursement_amount: number;
  reimbursement_quantity: number;
  stock_found_quantity: number;
  sent_quantity?: number;
  messages?: Message[];
  is_last_message_from_automation: boolean;
}

export interface IRefundBySkus {
  asin: string;
  image: string;
  missings: number;
  name: string;
  quantity_received: number;
  quantity_shipped: number;
  quantity_send?: number;
  refund: number;
  sku: string;
}

export interface QuantityBundleRecommendation extends Recommendation {
  average_fee_per_unit: number;
  costsavings: Costsavings;
  cta_id: string;
  currency: (typeof supportedCurrencies)[number];
  image: string;
  name: string;
  orders: number;
  percentage: number;
  products: Product[];
  quantity: number;
  resolved: boolean;
  resolved_status: string;
  resolver: string;
  seen: false;
  stock: number;
  usecase: string;
  bundle_sku?: string;
  realized_savings: number;
  orders_new_bundle: number;
  average_saving_per_order: number;
}

export interface ProductBundleRecommendation extends Recommendation {
  products: Product[];
  orders: number;
  costsavings: Costsavings;
  percentage: number;
  average_fee_per_unit: number;
  usecase: string;
  seen: boolean;
  resolved: boolean;
  resolved_status: string;
  cta_id: string;
  currency: (typeof supportedCurrencies)[number];
  quantity: number;
  bundle_sku?: string;
  realized_savings: number;
  orders_new_bundle: number;
  average_saving_per_order: number;
}

export interface IReviewsTrigger extends Recommendation {
  toggle_name: string;
  active: boolean;
  time_savings_per_year_in_hrs: number;
}
export interface INegativeReviewsTrigger extends Recommendation {
  toggle_name: string;
  active: boolean;
  time_savings_per_year_in_hrs: number;
}
export interface IInboundLabelsTrigger extends Recommendation {
  toggle_name: string;
  active: boolean;
}

export interface Costsavings {
  min: number;
  max: number;
}

export interface DbDate {
  $date: DbDateNumber;
}

export interface DbDateNumber {
  $numberLong: string;
}

export interface Product {
  sku: string;
  asin: string;
  name?: string;
  image?: string;
}

export interface UserRecommendationCount {
  all: number;
  resolved: number;
  unresolved: number;
  amazon_account_id: string;
}
export interface Message {
  _id: string;
  created_at: string;
  updated_at: string;
  sender: string;
  receiver: string;
  text: string;
  files: string[];
  seen: boolean;
  reply_required?: boolean;
}

export interface RecommendationSavings {
  potential: number;
  realized: number;
  currency: string;
}
export interface NumberOfRecommendations {
  total: number;
  completed: number;
}

export interface UsecaseData {
  automated: boolean;
  data: Recommendation[];
  savings: RecommendationSavings;
  number_of_recommendations: NumberOfRecommendations;
}

export const supportedWeightUnits = ['pounds', 'kilograms'] as const;

export const supportedDimensionsUnits = ['inches', 'centimeters'] as const;

export const RecommendationTasksCountMetaSchema = z.object({
  newOverall: z.number(),
  openOverall: z.number()
});
export type RecommendationTasksCountMeta = z.infer<typeof RecommendationTasksCountMetaSchema>;
export const RecommendationTasksCountItemSchema = z.object({
  amazon_account_id: z.string(),
  tasks: z.object({
    newCount: z.number(),
    openCount: z.number()
  })
});
export type RecommendationTasksCountItem = z.infer<typeof RecommendationTasksCountItemSchema>;
export const RecommendationTasksCountDataSchema = z.array(RecommendationTasksCountItemSchema);
export type RecommendationTasksCountData = z.infer<typeof RecommendationTasksCountDataSchema>;

export const RecommndationTasksCountSchema = z.object({
  meta: RecommendationTasksCountMetaSchema,
  data: RecommendationTasksCountDataSchema
});
export type RecommendationTasksCount = z.infer<typeof RecommndationTasksCountSchema>;
