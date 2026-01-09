import { Event, EventsApiResponse } from '@/types/events';
import { AuthService } from './authService';

export async function fetchEvents(siteId: string = '1'): Promise<Event[]> {
  const session = AuthService.loadSession();

  if (!session) {
    throw new Error('Not authenticated');
  }

  const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/fetch-events?apikey=${encodeURIComponent(session.apiKey)}&siteid=${siteId}`;
  const headers = {
    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  };

  const response = await fetch(apiUrl, { headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch events: ${response.status}`);
  }

  const data: EventsApiResponse = await response.json();
  return data.events || [];
}
