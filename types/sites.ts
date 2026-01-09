export interface SiteKey {
  name: string;
  value: string;
}

export interface Site {
  siteid: number;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  email?: string;
  phone?: string;
  street?: string;
  housenumber?: string;
  shortName?: string;
  keys?: SiteKey[];
}

export interface SitesResponse {
  items: Site[];
}
