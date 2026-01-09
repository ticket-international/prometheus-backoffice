import { Transaction, DateFilter, APIResponse } from '@/types/orders';
import { generateMockOrders } from './mockData';
import { Invoice, InvoiceFilter } from '@/types/invoices';
import { generateMockInvoices } from './mockInvoices';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zelcufbepxzddseybtkv.supabase.co';
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/fetch-orders`;

export async function fetchOrders(dateFilter?: DateFilter, apiKey?: string, siteId?: number): Promise<Transaction[]> {
  try {
    if (!apiKey) {
      throw new Error('API key is required');
    }

    const params = new URLSearchParams({
      apikey: apiKey,
    });

    if (siteId) {
      params.append('siteid', siteId.toString());
    }

    if (dateFilter?.from) {
      params.append('from', dateFilter.from);
    }

    if (dateFilter?.to) {
      params.append('to', dateFilter.to);
    }

    const url = `${EDGE_FUNCTION_URL}?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) {
      throw new Error(`Edge Function returned status ${response.status}`);
    }

    const data: APIResponse = await response.json();

    if (data.transactions && Array.isArray(data.transactions) && data.transactions.length > 0) {
      return data.transactions;
    }

    throw new Error('No valid data from API');
  } catch (error) {
    console.warn('API fetch failed, using mock data:', error);
    return generateMockOrders(20);
  }
}

export async function fetchInvoices(filter?: InvoiceFilter): Promise<Invoice[]> {
  try {
    return generateMockInvoices(3);
  } catch (error) {
    console.warn('Failed to fetch invoices, using mock data:', error);
    return generateMockInvoices(3);
  }
}
