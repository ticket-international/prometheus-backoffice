export interface DisputeAmount {
  breakdown: {
    item_total: {
      currency_code: string;
      value: string;
    };
  };
  currency_code: string;
  value: string;
}

export interface DisputeItem {
  item_name: string;
  item_description: string;
  item_quantity: string;
  reason: string;
  item_type: string;
}

export interface DisputeTransaction {
  buyer_transaction_id: string;
  seller_transaction_id: string;
  create_time: string;
  transaction_status: string;
  gross_amount: DisputeAmount | null;
  seller?: {
    merchant_id: string;
  };
  buyer?: {
    email: string;
    name: string;
  } | null;
  items?: DisputeItem[];
  seller_protection_eligible?: boolean;
  seller_protection_type?: string;
  regulation_info?: any;
  provisional_credit_status?: string;
}

export interface DisputeExtensions {
  merchant_contacted?: boolean;
  buyer_contacted_time?: string;
  buyer_contacted_channel?: string;
}

export interface DisputeOffer {
  buyer_requested_amount?: DisputeAmount;
}

export interface DisputeAdjudication {
  adjudication_time: string;
  dispute_life_cycle_stage: string;
  reason: string;
  type: string;
}

export interface DisputeMovement {
  affected_party: string;
  party: string;
  amount: DisputeAmount;
  initiated_time: string;
  type: string;
  reason: string;
}

export interface DisputeDocument {
  name: string;
  url: string;
}

export interface DisputeEvidence {
  date: string;
  dispute_life_cycle_stage: string;
  documents: DisputeDocument[];
  evidence_type: string;
  notes: string;
  source: string;
}

export interface DisputeOutcome {
  transaction_fee: string;
}

export interface RefundDetails {
  allowed_refund_amount: DisputeAmount;
}

export interface Dispute {
  dispute_id: string;
  create_time: string;
  update_time: string;
  disputed_transactions: DisputeTransaction[];
  reason: string;
  status: string;
  dispute_state: string;
  dispute_amount: DisputeAmount;
  dispute_life_cycle_stage: string;
  dispute_channel: string;
  seller_response_due_date: string;
  outcome?: string;
  extensions?: DisputeExtensions;
  offer?: DisputeOffer;
  messages?: any[];
  history?: any[];
  adjudications?: DisputeAdjudication[];
  dispute_outcome?: DisputeOutcome;
  fund_movements?: DisputeMovement[];
  money_movements?: DisputeMovement[];
  evidences?: DisputeEvidence[];
  refund_details?: RefundDetails;
  fee_policy?: any;
  allowed_response_options?: any;
}

export interface DisputesResponse {
  items: Dispute[];
}
