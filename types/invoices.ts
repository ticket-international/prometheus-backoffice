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

export interface InvoiceAPIResponse {
  SiteID: number;
  DateFrom: string;
  DateTo: string;
  GrossAmount: number;
  CustomerAmount: number;
  PaidAmount: number;
  InvoiceID: number;
  VersionNr: number;
}

export interface InvoiceAPIErrorResponse {
  hTTPError: string;
  returnCode: number;
  detailCode: number;
  message: string;
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
