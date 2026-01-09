export interface MailDebug {
  delivered: string;
  opened: string;
  state: string;
  stateCode: number;
  message: string;
}

export interface OrderItem {
  type: string;
  name: string;
  count: number;
  collected: number;
  refunded: number;
}

export interface Transaction {
  state: string;
  stateID: number;
  siteName: string;
  siteID: number;
  companyID: number;
  iD: string;
  customer: string;
  email: string;
  paymentID: string;
  paymentOwner: string;
  dtPay: string;
  dtBook: string;
  dtRefund: string;
  amount: number;
  orderID: number;
  mailSent: number;
  mailDebug: MailDebug | null;
  eventName: string;
  imageUrl: string;
  eventID: number;
  showID: number;
  showTime: string;
  screen: string;
  version: string;
  items: OrderItem[];
}

export interface DateFilter {
  from?: string;
  to?: string;
}

export interface APIResponse {
  transactions?: Transaction[];
  success?: boolean;
  error?: string;
  useMockData?: boolean;
}
