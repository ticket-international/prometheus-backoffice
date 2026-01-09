export interface RecurringCampaign {
  id: string;
  campaign_type: string;
  name: string;
  description: string;
  is_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface OnetimeCampaign {
  id: string;
  name: string;
  description: string;
  target_audience: string;
  scheduled_date?: string;
  status: 'draft' | 'scheduled' | 'sent';
  sent_date?: string;
  recipient_count: number;
  created_at?: string;
  updated_at?: string;
}
