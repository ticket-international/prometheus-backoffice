export interface Rectangle {
  id: number;
  position: number;
  isActive: boolean;
  isCentrallyManaged: boolean;
  campaignName?: string;
  imageUrl?: string;
  targetUrl?: string;
  linkType?: 'none' | 'film' | 'showing' | 'attribute';
  linkedFilmId?: string;
  linkedShowingId?: string;
  linkedAttributeId?: string;
  linkedAttributeType?: 'genre' | 'actor' | 'director';
  linkedEventId?: number;
  linkedEventName?: string;
  title?: string;
  validFrom?: string;
  validTo?: string;
  dtCreated?: string;
}

export interface RectangleCampaign {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'scheduled' | 'ended';
}

export interface RectangleApiItem {
  ID: string;
  Title?: string;
  ImageSource: string;
  Link: string;
  Position: string;
  Show: string;
  ValidFrom?: string;
  ValidTo?: string;
  dtCreated?: string;
}

export interface RectangleApiResponse {
  page: number;
  perPage: number;
  total: number;
  items: RectangleApiItem[];
}
