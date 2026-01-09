import { RevenueStats, RevenueSummary, TimeInterval } from '@/types/revenue';
import { startOfWeek, startOfMonth, startOfYear, format, addDays, subDays, isAfter, isBefore, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

export function generateMockRevenueData(days: number = 90): RevenueStats[] {
  const stats: RevenueStats[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    const dateStr = format(date, 'yyyy-MM-dd');

    const soldTickets = Math.floor(Math.random() * 200) + 100;
    const reservedTickets = Math.floor(Math.random() * 50) + 10;
    const ticketPrice = 12.5;
    const ticketRevenue = soldTickets * ticketPrice;

    const articleRevenue = Math.random() * 800 + 400;
    const voucherRevenue = Math.random() * 200 + 50;

    const totalRevenue = ticketRevenue + articleRevenue + voucherRevenue;

    const paypalRevenue = totalRevenue * (Math.random() * 0.3 + 0.3);
    const voucherPayments = totalRevenue * (Math.random() * 0.1 + 0.05);
    const cardRevenue = totalRevenue - paypalRevenue - voucherPayments;

    stats.push({
      date: dateStr,
      soldTickets,
      reservedTickets,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      articleRevenue: parseFloat(articleRevenue.toFixed(2)),
      voucherRevenue: parseFloat(voucherRevenue.toFixed(2)),
      paypalRevenue: parseFloat(paypalRevenue.toFixed(2)),
      cardRevenue: parseFloat(cardRevenue.toFixed(2)),
      voucherPayments: parseFloat(voucherPayments.toFixed(2)),
    });
  }

  return stats;
}

export function filterRevenueByDateRange(
  data: RevenueStats[],
  startDate: string,
  endDate: string
): RevenueStats[] {
  const start = parseISO(startDate);
  const end = parseISO(endDate);

  return data.filter(stat => {
    const statDate = parseISO(stat.date);
    return !isBefore(statDate, start) && !isAfter(statDate, end);
  });
}

export function aggregateRevenueByInterval(
  data: RevenueStats[],
  interval: TimeInterval
): RevenueStats[] {
  if (interval === 'day') return data;

  const grouped = new Map<string, RevenueStats[]>();

  data.forEach(stat => {
    const date = parseISO(stat.date);
    let key: string;

    switch (interval) {
      case 'week':
        key = format(startOfWeek(date, { locale: de }), 'yyyy-MM-dd');
        break;
      case 'month':
        key = format(startOfMonth(date), 'yyyy-MM-dd');
        break;
      case 'year':
        key = format(startOfYear(date), 'yyyy-MM-dd');
        break;
      default:
        key = stat.date;
    }

    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(stat);
  });

  return Array.from(grouped.entries()).map(([date, stats]) => ({
    date,
    soldTickets: stats.reduce((sum, s) => sum + s.soldTickets, 0),
    reservedTickets: stats.reduce((sum, s) => sum + s.reservedTickets, 0),
    totalRevenue: parseFloat(stats.reduce((sum, s) => sum + s.totalRevenue, 0).toFixed(2)),
    articleRevenue: parseFloat(stats.reduce((sum, s) => sum + s.articleRevenue, 0).toFixed(2)),
    voucherRevenue: parseFloat(stats.reduce((sum, s) => sum + s.voucherRevenue, 0).toFixed(2)),
    paypalRevenue: parseFloat(stats.reduce((sum, s) => sum + s.paypalRevenue, 0).toFixed(2)),
    cardRevenue: parseFloat(stats.reduce((sum, s) => sum + s.cardRevenue, 0).toFixed(2)),
    voucherPayments: parseFloat(stats.reduce((sum, s) => sum + s.voucherPayments, 0).toFixed(2)),
  }));
}

export function calculateRevenueSummary(data: RevenueStats[]): RevenueSummary {
  if (data.length === 0) {
    return {
      totalSoldTickets: 0,
      totalReservedTickets: 0,
      totalRevenue: 0,
      totalArticleRevenue: 0,
      totalVoucherRevenue: 0,
      totalPaypalRevenue: 0,
      totalCardRevenue: 0,
      totalVoucherPayments: 0,
      averageTicketPrice: 0,
      averageDailyRevenue: 0,
    };
  }

  const totalSoldTickets = data.reduce((sum, s) => sum + s.soldTickets, 0);
  const totalReservedTickets = data.reduce((sum, s) => sum + s.reservedTickets, 0);
  const totalRevenue = data.reduce((sum, s) => sum + s.totalRevenue, 0);
  const totalArticleRevenue = data.reduce((sum, s) => sum + s.articleRevenue, 0);
  const totalVoucherRevenue = data.reduce((sum, s) => sum + s.voucherRevenue, 0);
  const totalPaypalRevenue = data.reduce((sum, s) => sum + s.paypalRevenue, 0);
  const totalCardRevenue = data.reduce((sum, s) => sum + s.cardRevenue, 0);
  const totalVoucherPayments = data.reduce((sum, s) => sum + s.voucherPayments, 0);

  const ticketRevenue = totalRevenue - totalArticleRevenue - totalVoucherRevenue;
  const averageTicketPrice = totalSoldTickets > 0 ? ticketRevenue / totalSoldTickets : 0;
  const averageDailyRevenue = data.length > 0 ? totalRevenue / data.length : 0;

  return {
    totalSoldTickets,
    totalReservedTickets,
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    totalArticleRevenue: parseFloat(totalArticleRevenue.toFixed(2)),
    totalVoucherRevenue: parseFloat(totalVoucherRevenue.toFixed(2)),
    totalPaypalRevenue: parseFloat(totalPaypalRevenue.toFixed(2)),
    totalCardRevenue: parseFloat(totalCardRevenue.toFixed(2)),
    totalVoucherPayments: parseFloat(totalVoucherPayments.toFixed(2)),
    averageTicketPrice: parseFloat(averageTicketPrice.toFixed(2)),
    averageDailyRevenue: parseFloat(averageDailyRevenue.toFixed(2)),
  };
}

export function formatDateByInterval(dateStr: string, interval: TimeInterval): string {
  const date = parseISO(dateStr);

  switch (interval) {
    case 'day':
      return format(date, 'dd.MM.yyyy', { locale: de });
    case 'week':
      return `KW ${format(date, 'w yyyy', { locale: de })}`;
    case 'month':
      return format(date, 'MMMM yyyy', { locale: de });
    case 'year':
      return format(date, 'yyyy', { locale: de });
    default:
      return dateStr;
  }
}
