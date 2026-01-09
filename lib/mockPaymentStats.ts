import { PaymentStats } from '@/types/payments';

export const mockPaymentStats: PaymentStats = {
  total_transactions: 3842,
  total_amount: 148750.50,
  currency: 'EUR',
  by_type: [
    {
      type: 'paypal',
      label: 'PayPal',
      count: 1256,
      amount: 52340.80,
      currency: 'EUR',
      percentage: 35.2
    },
    {
      type: 'mastercard',
      label: 'Mastercard',
      count: 982,
      amount: 38920.40,
      currency: 'EUR',
      percentage: 26.2
    },
    {
      type: 'visa',
      label: 'Visa',
      count: 845,
      amount: 34180.20,
      currency: 'EUR',
      percentage: 23.0
    },
    {
      type: 'gutschein',
      label: 'Gutschein',
      count: 412,
      amount: 12850.60,
      currency: 'EUR',
      percentage: 8.6
    },
    {
      type: 'kundenkarte',
      label: 'Kundenkarte',
      count: 245,
      amount: 7680.30,
      currency: 'EUR',
      percentage: 5.2
    },
    {
      type: 'stornogutschein',
      label: 'Stornogutschein',
      count: 102,
      amount: 2778.20,
      currency: 'EUR',
      percentage: 1.8
    }
  ]
};
