'use client';

import { useState, useEffect } from 'react';
import { FiLoader } from 'react-icons/fi';
import { GripVertical, Save } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useSite } from '@/lib/SiteContext';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface SortingEvent {
  release: string;
  week: number;
  tickets: number;
  showCount: number;
  name: string;
  iD: number;
  imageUrl: string;
}

export default function PostersortierungPage() {
  const [events, setEvents] = useState<SortingEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { session } = useAuth();
  const { selectedSiteId } = useSite();

  useEffect(() => {
    if (!session?.apiKey || selectedSiteId === null) return;

    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams({
          endpoint: 'events/sorting',
          apikey: session.apiKey,
          siteid: selectedSiteId.toString(),
          companyid: '0'
        });

        const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/api-proxy`;

        const response = await fetch(`${apiUrl}?${queryParams.toString()}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          }
        });

        if (!response.ok) {
          throw new Error('Fehler beim Laden der Events');
        }

        const data = await response.json();
        setEvents(data.events);
      } catch (err) {
        console.error('Failed to fetch events:', err);
        setError(err instanceof Error ? err.message : 'Fehler beim Laden der Events');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [session, selectedSiteId]);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === index) return;

    const newEvents = [...events];
    const draggedItem = newEvents[draggedIndex];

    newEvents.splice(draggedIndex, 1);
    newEvents.splice(index, 0, draggedItem);

    setEvents(newEvents);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const formatReleaseDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd.MM.yyyy', { locale: de });
    } catch {
      return dateString;
    }
  };

  const handleSaveOrder = async () => {
    if (!session?.apiKey || selectedSiteId === null) return;

    setIsSaving(true);

    try {
      const eventids = events.map(event => event.iD).join(',');

      const queryParams = new URLSearchParams({
        endpoint: 'events/sorting',
        apikey: session.apiKey,
      });

      const postBody = new URLSearchParams({
        siteid: selectedSiteId.toString(),
        companyid: '0',
        eventids: eventids
      });

      const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/api-proxy`;

      const response = await fetch(`${apiUrl}?${queryParams.toString()}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: postBody.toString()
      });

      if (!response.ok) {
        throw new Error('Fehler beim Speichern der Reihenfolge');
      }

      toast.success('Die Postersortierung wurde erfolgreich aktualisiert.');
    } catch (err) {
      console.error('Failed to save order:', err);
      toast.error(err instanceof Error ? err.message : 'Fehler beim Speichern der Reihenfolge');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Postersortierung
        </h1>
        <p className="text-muted-foreground mt-2">
          Ordnen Sie die Filmplakate durch Ziehen und Ablegen in der gewünschten Reihenfolge an.
        </p>
      </header>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Aktuelle Filme
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Ziehen Sie die Zeilen, um die Anzeigereihenfolge zu ändern
            </p>
          </div>
          <Button
            onClick={handleSaveOrder}
            disabled={isSaving || isLoading || events.length === 0}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <FiLoader className="animate-spin" />
                Speichern...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Reihenfolge speichern
              </>
            )}
          </Button>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <FiLoader className="animate-spin text-4xl text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              {error}
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <table className="min-w-full text-left">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wide w-12">
                    </th>
                    <th className="px-4 py-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wide w-24">
                      Poster
                    </th>
                    <th className="px-4 py-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                      Titel
                    </th>
                    <th className="px-4 py-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                      Spielwoche
                    </th>
                    <th className="px-4 py-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                      Bundesstart
                    </th>
                    <th className="px-4 py-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                      Besucher
                    </th>
                    <th className="px-4 py-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                      Vorstellungen
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {events.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-sm">
                        Keine Events verfügbar
                      </td>
                    </tr>
                  ) : (
                    events.map((event, index) => (
                      <tr
                        key={event.iD}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`hover:bg-muted/60 transition-colors cursor-move ${
                          draggedIndex === index ? 'opacity-50' : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <GripVertical className="text-muted-foreground w-4 h-4" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="w-16 h-20 relative rounded overflow-hidden bg-muted">
                            <Image
                              src={event.imageUrl && event.imageUrl !== "" ? event.imageUrl : "/placeholder-movies.png"}
                              alt={event.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs font-medium text-foreground">
                            {event.name}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs text-foreground">
                            {event.week === 0 ? 'Vorpremiere' : `Woche ${event.week}`}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs text-foreground">
                            {formatReleaseDate(event.release)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs font-medium text-foreground">
                            {event.tickets.toLocaleString('de-DE')}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs text-foreground">
                            {event.showCount}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
