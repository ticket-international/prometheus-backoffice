export interface Movie {
  id: string;
  title: string;
  posterUrl: string;
  description: string;
  startDate: string;
  isCurrentlyShowing: boolean;
}

export interface ApiEvent {
  eventID: number;
  name: string;
  description?: string;
  shortInfo?: string;
  releaseDate?: string;
  images?: {
    posters?: Array<{
      url: string;
    }>;
  };
}

export interface ApiEventsResponse {
  events?: ApiEvent[];
}
