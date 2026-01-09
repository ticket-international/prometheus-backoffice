export interface RevenueStats {
  date: string;
  soldTickets: number;
  reservedTickets: number;
  totalRevenue: number;
  articleRevenue: number;
  voucherRevenue: number;
  paypalRevenue: number;
  cardRevenue: number;
  voucherPayments: number;
}

export interface RevenueSummary {
  totalSoldTickets: number;
  totalReservedTickets: number;
  totalRevenue: number;
  totalArticleRevenue: number;
  totalVoucherRevenue: number;
  totalPaypalRevenue: number;
  totalCardRevenue: number;
  totalVoucherPayments: number;
  averageTicketPrice: number;
  averageDailyRevenue: number;
}

export type TimeInterval = 'day' | 'week' | 'month' | 'year';
