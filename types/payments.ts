export interface PaymentTypeStats {
  type: string;
  label: string;
  count: number;
  amount: number;
  currency: string;
  percentage: number;
}

export interface PaymentStats {
  total_transactions: number;
  total_amount: number;
  currency: string;
  by_type: PaymentTypeStats[];
}
