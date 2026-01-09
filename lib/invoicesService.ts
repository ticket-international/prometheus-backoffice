import { ApiClient } from './apiClient';
import { Invoice, InvoiceAPIResponse, InvoiceAPIErrorResponse } from '@/types/invoices';

function transformInvoiceResponse(apiInvoice: InvoiceAPIResponse): Invoice {
  const dateFrom = new Date(apiInvoice.DateFrom);
  const dateTo = new Date(apiInvoice.DateTo);

  const year = dateFrom.getFullYear();
  const month = dateFrom.getMonth() + 1;

  return {
    id: `${apiInvoice.InvoiceID}-${apiInvoice.VersionNr}`,
    year,
    month,
    periodFrom: apiInvoice.DateFrom,
    periodTo: apiInvoice.DateTo,
    grossAmount: apiInvoice.GrossAmount,
    customerShare: apiInvoice.CustomerAmount,
    payoutAmount: apiInvoice.PaidAmount,
    version: apiInvoice.VersionNr,
    isActive: apiInvoice.VersionNr === 1,
    createdAt: apiInvoice.DateFrom,
    updatedAt: apiInvoice.DateFrom,
    notes: '',
  };
}

function isErrorResponse(data: any): data is InvoiceAPIErrorResponse {
  return data && 'hTTPError' in data;
}

export async function fetchInvoicesFromAPI(
  apiKey: string,
  siteId: number
): Promise<Invoice[]> {
  try {
    const response = await ApiClient.request<InvoiceAPIResponse[] | InvoiceAPIErrorResponse>(
      'reports/cinster/invoices/list',
      { apiKey, siteId }
    );

    if (isErrorResponse(response)) {
      throw new Error(response.message || response.hTTPError);
    }

    if (!Array.isArray(response)) {
      throw new Error('Invalid response format');
    }

    const invoices = response.map(transformInvoiceResponse);

    const groupedByPeriod = invoices.reduce((acc, invoice) => {
      const key = `${invoice.year}-${invoice.month}-${invoice.periodFrom}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(invoice);
      return acc;
    }, {} as Record<string, Invoice[]>);

    Object.values(groupedByPeriod).forEach(group => {
      if (group.length > 1) {
        group.sort((a, b) => b.version - a.version);
        group.forEach((invoice, index) => {
          invoice.isActive = index === 0;
        });
      }
    });

    return invoices;
  } catch (error) {
    console.error('Failed to fetch invoices from API:', error);
    throw error;
  }
}
