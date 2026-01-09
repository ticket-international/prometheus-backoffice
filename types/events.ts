export interface EventType {
  name: string;
  iD: number;
}

export interface Distributor {
  webSite: string;
  name: string;
  iD: number;
}

export interface Production {
  producer: string;
  company: string;
  country: string;
  countryID: number;
  date: string;
  year: number;
}

export interface Version {
  audio: string;
  subtitle: string;
  shortcut: string;
  is3D: boolean;
  deactivated: boolean;
  number: number;
  attributes: any[];
  name: string;
  iD: number;
}

export interface Genre {
  name: string;
  iD: number;
}

export interface Event {
  name: string;
  shortName: string;
  actors: string;
  additionalName: string;
  camera: string;
  child: boolean;
  credits: string;
  cut: string;
  description: string;
  director: string;
  eventID: number;
  eventType: EventType;
  distributor: Distributor;
  exportNumber: string;
  externalFilmID: string;
  format: string;
  headLine: string;
  homePage: string;
  iMAX: boolean;
  lastChange: string;
  length: number;
  mediaNumber: string;
  nFC: string;
  originalName: string;
  production: Production;
  poster: string;
  rating: string;
  ratingShortcut: string;
  ratingDescriptors: string;
  ratingID: number;
  releaseDate: string;
  script: string;
  settings: string;
  shortInfo: string;
  sound: string;
  suisaNumber: string;
  trailer1: string;
  trailer2: string;
  trailer3: string;
  version: Version;
  specials: any[];
  genres: Genre[];
  keywords: any[];
  images: any;
  cast: any;
  countries: any[];
  filters: {
    genres: number[];
    versions: any[];
    slots: any[];
    week: any[];
    frames: number[];
    ratings: number[];
    types: number[];
  };
}

export interface EventsApiResponse {
  events: Event[];
}
