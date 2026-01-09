export interface Customer {
  id: string;
  customer_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  mobile: string;
  street: string;
  postal_code: string;
  city: string;
  account_type: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerCard {
  id: string;
  customer_id: string;
  card_number: string;
  card_type: string;
  points: number;
  issued_date: string;
  expiry_date: string;
  status: string;
  created_at: string;
}

export interface Voucher {
  id: string;
  customer_id: string;
  voucher_code: string;
  amount: number;
  description: string;
  issued_date: string;
  expiry_date: string;
  used_date: string | null;
  status: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  customer_id: string;
  transaction_number: string;
  transaction_type: string;
  amount: number;
  description: string;
  payment_method: string;
  transaction_date: string;
  created_at: string;
}

export interface Ticket {
  id: string;
  customer_id: string;
  ticket_number: string;
  movie_title: string;
  show_date: string;
  seat_number: string;
  price: number;
  purchase_date: string;
  status: string;
  created_at: string;
}

export interface CustomerStats {
  totalCustomers: number;
  regularAccounts: number;
  guestAccounts: number;
  activeCustomersLast30Days: number;
}

export interface NewRegistration {
  date: string;
  count: number;
}

export interface TopCustomer {
  customer_id: string;
  customer_number: string;
  first_name: string;
  last_name: string;
  email: string;
  ticket_count: number;
  total_spent: number;
}
