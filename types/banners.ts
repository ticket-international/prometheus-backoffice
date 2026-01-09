export interface BannerCampaign {
  id: string;
  name: string;
  type: 'film' | 'event' | 'promotion';
  status: 'active' | 'paused' | 'ended';
  imageUrl: string;
  startDate: string;
  endDate: string;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  budget: number;
  targetAudience?: string;
  placement?: string[];
}

export interface BannerStats {
  ctr: number;
  conversionRate: number;
  cpc: number;
  roas: number;
}

export interface BannerApiItem {
  ID: string;
  Link: string;
  ImageSource: string;
  Position: string;
  Active: string;
}

export interface BannerApiResponse {
  page: number;
  perPage: number;
  total: number;
  items: BannerApiItem[];
}
