export interface ArticleTransaction {
  id: string;
  transactionId: string;
  showtime: string;
  movieTitle: string;
  hall: string;
  articleName: string;
  amount: number;
  isCancelled: boolean;
  timestamp: string;
  articleGroup: string;
}

export interface ArticleGroupStats {
  group: string;
  revenue: number;
  transactions: number;
  color: string;
}

export interface ArticleKPIs {
  presaleRevenue: number;
  todayTransactions: number;
  todayRevenue: number;
  bestArticle: {
    name: string;
    revenue: number;
    quantity: number;
  };
  bestGroup: {
    name: string;
    revenue: number;
  };
}
