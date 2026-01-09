'use client';

import { PaymentStats } from '@/types/payments';
import { FiCreditCard, FiDollarSign, FiGift, FiTag, FiTrendingUp } from 'react-icons/fi';

interface PaymentTypeStatsProps {
  stats: PaymentStats;
}

export default function PaymentTypeStats({ stats }: PaymentTypeStatsProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'paypal':
        return <FiDollarSign size={24} />;
      case 'mastercard':
        return <FiCreditCard size={24} />;
      case 'visa':
        return <FiCreditCard size={24} />;
      case 'gutschein':
        return <FiGift size={24} />;
      case 'kundenkarte':
        return <FiCreditCard size={24} />;
      case 'stornogutschein':
        return <FiTag size={24} />;
      default:
        return <FiDollarSign size={24} />;
    }
  };

  const getColorClasses = (type: string) => {
    switch (type) {
      case 'paypal':
        return 'border-blue-500/30 bg-blue-500/5 text-blue-500';
      case 'mastercard':
        return 'border-orange-500/30 bg-orange-500/5 text-orange-500';
      case 'visa':
        return 'border-sky-500/30 bg-sky-500/5 text-sky-500';
      case 'gutschein':
        return 'border-emerald-500/30 bg-emerald-500/5 text-emerald-500';
      case 'kundenkarte':
        return 'border-pink-500/30 bg-pink-500/5 text-pink-500';
      case 'stornogutschein':
        return 'border-amber-500/30 bg-amber-500/5 text-amber-500';
      default:
        return 'border-border bg-muted text-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Zahlungen nach Art
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Verteilung der verschiedenen Zahlungsmethoden
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold tracking-tight">
              {stats.total_transactions.toLocaleString('de-DE')}
            </div>
            <div className="text-xs text-muted-foreground">
              Transaktionen gesamt
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {stats.by_type.map((paymentType) => (
            <div
              key={paymentType.type}
              className={`card p-5 space-y-4 ${getColorClasses(paymentType.type)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {getIcon(paymentType.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">
                      {paymentType.label}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {paymentType.percentage}% Anteil
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-muted-foreground">
                    Transaktionen
                  </span>
                  <span className="text-lg font-bold">
                    {paymentType.count.toLocaleString('de-DE')}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-muted-foreground">
                    Summe
                  </span>
                  <span className="text-lg font-bold">
                    {paymentType.amount.toLocaleString('de-DE', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })} €
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <div className="relative h-2 bg-background rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-current opacity-50 transition-all"
                    style={{ width: `${paymentType.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FiTrendingUp size={16} />
              <span className="text-sm font-medium">Gesamtumsatz</span>
            </div>
            <div className="text-2xl font-bold tracking-tight">
              {stats.total_amount.toLocaleString('de-DE', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })} €
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
