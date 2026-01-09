export interface Invoice {
  id: string;
  year: number;
  month: number;
  periodFrom: string;
  periodTo: string;
  grossAmount: number;
  customerShare: number;
  payoutAmount: number;
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  notes: string;
}

export interface InvoiceGroup {
  year: number;
  month: number;
  invoices: Invoice[];
  activeInvoice: Invoice;
}

export interface InvoiceFilter {
  year?: number;
}
