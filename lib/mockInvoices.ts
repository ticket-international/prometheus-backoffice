import { faker } from '@faker-js/faker';
import { Invoice } from '@/types/invoices';

const monthNames = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];

function generateInvoiceForPeriod(
  year: number,
  month: number,
  periodNumber: 1 | 2,
  versionCount: number = 1
): Invoice[] {
  const invoices: Invoice[] = [];

  const startDay = periodNumber === 1 ? 1 : 16;
  const endDay = periodNumber === 1 ? 15 : new Date(year, month, 0).getDate();

  const periodFrom = new Date(year, month - 1, startDay);
  const periodTo = new Date(year, month - 1, endDay);

  const baseGrossAmount = faker.number.float({ min: 50000, max: 150000, fractionDigits: 2 });

  for (let v = 1; v <= versionCount; v++) {
    const grossAmount = v > 1
      ? baseGrossAmount + faker.number.float({ min: -5000, max: 5000, fractionDigits: 2 })
      : baseGrossAmount;

    const customerSharePercent = faker.number.float({ min: 45, max: 55, fractionDigits: 2 });
    const customerShare = (grossAmount * customerSharePercent) / 100;
    const payoutAmount = grossAmount - customerShare;

    const createdDate = new Date(year, month - 1, endDay + v);

    invoices.push({
      id: faker.string.uuid(),
      year,
      month,
      periodFrom: periodFrom.toISOString().split('T')[0],
      periodTo: periodTo.toISOString().split('T')[0],
      grossAmount: parseFloat(grossAmount.toFixed(2)),
      customerShare: parseFloat(customerShare.toFixed(2)),
      payoutAmount: parseFloat(payoutAmount.toFixed(2)),
      version: v,
      isActive: v === versionCount,
      createdAt: createdDate.toISOString(),
      updatedAt: createdDate.toISOString(),
      notes: v > 1 ? 'Korrektur der ursprünglichen Abrechnung' : ''
    });
  }

  return invoices;
}

export function generateMockInvoices(yearCount: number = 2): Invoice[] {
  const invoices: Invoice[] = [];
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  for (let yearOffset = 0; yearOffset < yearCount; yearOffset++) {
    const year = currentYear - yearOffset;

    for (let month = 12; month >= 1; month--) {
      if (yearOffset === 0 && month > currentMonth) continue;

      const hasMultipleVersions = faker.datatype.boolean({ probability: 0.15 });
      const versionCount = hasMultipleVersions ? faker.number.int({ min: 2, max: 4 }) : 1;

      invoices.push(...generateInvoiceForPeriod(year, month, 1, versionCount));

      const hasMultipleVersionsPeriod2 = faker.datatype.boolean({ probability: 0.15 });
      const versionCountPeriod2 = hasMultipleVersionsPeriod2 ? faker.number.int({ min: 2, max: 3 }) : 1;

      invoices.push(...generateInvoiceForPeriod(year, month, 2, versionCountPeriod2));
    }
  }

  return invoices.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    if (a.month !== b.month) return b.month - a.month;
    const aPeriod = new Date(a.periodFrom).getDate() === 1 ? 1 : 2;
    const bPeriod = new Date(b.periodFrom).getDate() === 1 ? 1 : 2;
    if (aPeriod !== bPeriod) return bPeriod - aPeriod;
    return b.version - a.version;
  });
}

export function getMonthName(month: number): string {
  return monthNames[month - 1] || '';
}
