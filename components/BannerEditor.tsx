'use client';

import { useState, useEffect } from 'react';
import { BannerApiItem } from '@/types/banners';
import { Event } from '@/types/events';
import { fetchEvents } from '@/lib/eventsService';
import { useSite } from '@/lib/SiteContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BannerEditorProps {
  banner: BannerApiItem & { linkedEventId?: number; linkedEventName?: string };
  isOpen: boolean;
  onClose: () => void;
  onSave: (banner: BannerApiItem & { linkedEventId?: number; linkedEventName?: string }) => void;
}

export function BannerEditor({ banner, isOpen, onClose, onSave }: BannerEditorProps) {
  const { selectedSiteId, selectedWordpressUrl } = useSite();
  const [editedBanner, setEditedBanner] = useState(banner);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEditedBanner(banner);
      loadEvents();
    }
  }, [isOpen, banner]);

  const loadEvents = async () => {
    setIsLoadingEvents(true);
    try {
      const siteId = selectedSiteId?.toString() || '1';
      const eventsData = await fetchEvents(siteId);

      const uniqueEvents = eventsData.reduce((acc: Event[], event) => {
        if (!acc.find(e => e.eventID === event.eventID)) {
          acc.push(event);
        }
        return acc;
      }, []);

      setEvents(uniqueEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      setEvents([]);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const handleSave = () => {
    onSave(editedBanner);
    onClose();
  };

  const handleEventChange = (eventId: string) => {
    if (eventId === 'none') {
      setEditedBanner({
        ...editedBanner,
        linkedEventId: undefined,
        linkedEventName: undefined,
      });
    } else {
      const event = events.find(e => e.eventID.toString() === eventId);

      let linkUrl = editedBanner.Link;
      if (selectedWordpressUrl && event?.eventID) {
        const baseUrl = selectedWordpressUrl.startsWith('http')
          ? selectedWordpressUrl
          : `https://${selectedWordpressUrl}`;
        linkUrl = `${baseUrl}/eventdetails/?eventID=${event.eventID}`;
      }

      setEditedBanner({
        ...editedBanner,
        linkedEventId: event?.eventID,
        linkedEventName: event?.name,
        Link: linkUrl,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Banner bearbeiten</DialogTitle>
          <DialogDescription>
            Einstellungen für das Banner konfigurieren
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="position">Sortierung</Label>
            <Input
              id="position"
              type="number"
              value={editedBanner.Position}
              onChange={(e) =>
                setEditedBanner({ ...editedBanner, Position: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageSource">Banner-Bild URL</Label>
            <Input
              id="imageSource"
              type="text"
              placeholder="https://example.com/banner.jpg"
              value={editedBanner.ImageSource}
              onChange={(e) =>
                setEditedBanner({ ...editedBanner, ImageSource: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link">Link URL</Label>
            <Input
              id="link"
              type="text"
              placeholder="https://example.com"
              value={editedBanner.Link}
              onChange={(e) =>
                setEditedBanner({ ...editedBanner, Link: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedEvent">Eventverknüpfung</Label>
            <Select
              value={editedBanner.linkedEventId?.toString() || 'none'}
              onValueChange={handleEventChange}
              disabled={isLoadingEvents || events.length === 0}
            >
              <SelectTrigger id="linkedEvent">
                <SelectValue placeholder={isLoadingEvents ? "Events werden geladen..." : events.length === 0 ? "Keine Events verfügbar" : "Event auswählen"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Keine Verknüpfung</SelectItem>
                {events.map((event) => (
                  <SelectItem key={event.eventID} value={event.eventID.toString()}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {events.length === 0 && !isLoadingEvents && (
              <p className="text-sm text-muted-foreground">
                Keine Events für diese Seite verfügbar
              </p>
            )}
            {editedBanner.linkedEventId && (
              <p className="text-sm text-muted-foreground">
                Event-ID: {editedBanner.linkedEventId}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button onClick={handleSave}>Speichern</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
