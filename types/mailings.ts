export interface MailingStatistics {
  recipients: number;
  receives: number;
  bounces: number;
  unsubscribes: number;
  abuses: number;
  opens: number;
  opensunique: number;
  clicks: number;
  clicksunique: number;
}

export interface ApiMailing {
  iD: number;
  subject: string;
  filterID: number;
  filterName: string;
  siteID: number;
  siteName: string;
  archived: number;
  content: string;
  startTime: string;
  testTime: string;
  sentTime: string;
  created: string;
  recipients: number;
  externalID: number;
  hasContent: number;
  cancelAllowed: number;
  statistics: MailingStatistics | null;
  events: any[];
}

export interface ApiMailingsResponse {
  mailings: ApiMailing[];
}

export interface Mailing {
  id: string;
  name: string;
  subject: string;
  content: string;
  customer_filter: string;
  status: 'sent' | 'scheduled' | 'draft';
  campaign?: string;
  scheduled_date?: string;
  scheduled_time?: string;
  sent_date?: string;
  date: string;
  sendTime: string;
  recipients: number;
  opens: number;
  clicks: number;
  bounces: number;
  unsubscribes: number;
  is_archived: boolean;
  isArchived?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MailingStats {
  openRate: number;
  clickRate: number;
  bounceRate: number;
  unsubscribeRate: number;
}

export interface CustomerFilter {
  value: string;
  label: string;
  description: string;
}

export interface MailingDraft {
  name: string;
  subject: string;
  customer_filter: string;
  campaign?: string;
  content: string;
}
