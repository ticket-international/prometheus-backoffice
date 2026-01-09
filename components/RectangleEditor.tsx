'use client';

import { useState, useEffect } from 'react';
import { Rectangle, RectangleCampaign } from '@/types/rectangles';
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
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockCampaigns } from '@/lib/mockRectangles';

interface RectangleEditorProps {
  rectangle: Rectangle;
  isOpen: boolean;
  onClose: () => void;
  onSave: (rectangle: Rectangle) => void;
}

export function RectangleEditor({ rectangle, isOpen, onClose, onSave }: RectangleEditorProps) {
  const { selectedSiteId, selectedWordpressUrl, sites } = useSite();
  const [editedRectangle, setEditedRectangle] = useState<Rectangle>(rectangle);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  useEffect(() => {
    console.log('=== RectangleEditor State ===');
    console.log('selectedSiteId:', selectedSiteId);
    console.log('selectedWordpressUrl:', selectedWordpressUrl);
    console.log('sites:', sites);
    const currentSite = sites.find(s => s.siteid === selectedSiteId);
    console.log('currentSite:', currentSite);
    console.log('currentSite.keys:', currentSite?.keys);
  }, [selectedSiteId, selectedWordpressUrl, sites]);

  useEffect(() => {
    if (isOpen) {
      setEditedRectangle(rectangle);
      loadEvents();
    }
  }, [isOpen, rectangle]);

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
    onSave(editedRectangle);
    onClose();
  };

  const handleCampaignChange = (campaignId: string) => {
    const campaign = mockCampaigns.find(c => c.id === campaignId);
    setEditedRectangle(prev => ({
      ...prev,
      campaignName: campaign?.name,
    }));
  };

  const handleEventChange = (eventId: string) => {
    console.log('=== Event Change Handler ===');
    console.log('Event ID:', eventId);
    console.log('Selected WordPress URL:', selectedWordpressUrl);
    console.log('Current editedRectangle.targetUrl:', editedRectangle.targetUrl);

    if (eventId === 'none') {
      setEditedRectangle(prev => {
        console.log('Clearing event link');
        return {
          ...prev,
          linkedEventId: undefined,
          linkedEventName: undefined,
        };
      });
    } else {
      const event = events.find(e => e.eventID.toString() === eventId);
      console.log('Found event:', event);

      setEditedRectangle(prev => {
        console.log('Previous state in setter:', prev);
        let targetUrl = prev.targetUrl || '';
        let baseUrl = '';

        if (event?.eventID) {
          if (selectedWordpressUrl) {
            baseUrl = selectedWordpressUrl.startsWith('http')
              ? selectedWordpressUrl
              : `https://${selectedWordpressUrl}`;
            targetUrl = `${baseUrl}/eventdetails/?eventID=${event.eventID}`;
            console.log('✓ Generated URL with WordPress URL:', targetUrl);
          } else if (targetUrl) {
            const urlMatch = targetUrl.match(/^(https?:\/\/[^/?]+)/);
            if (urlMatch) {
              baseUrl = urlMatch[1];
              targetUrl = `${baseUrl}/eventdetails/?eventID=${event.eventID}`;
              console.log('✓ Generated URL from existing URL. Base:', baseUrl, 'New URL:', targetUrl);
            } else {
              console.log('✗ Could not parse existing URL:', targetUrl);
            }
          } else {
            console.log('✗ No WordPress URL and no existing URL to parse');
          }
        }

        const newState = {
          ...prev,
          linkedEventId: event?.eventID,
          linkedEventName: event?.name,
          targetUrl: targetUrl,
        };

        console.log('New state:', newState);
        return newState;
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Kachel {rectangle.position} bearbeiten</DialogTitle>
          <DialogDescription>
            Einstellungen für die Rectangle-Kachel konfigurieren
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">Kachel aktivieren</Label>
              <p className="text-sm text-muted-foreground">
                Kachel auf der Webseite anzeigen
              </p>
            </div>
            <Switch
              id="isActive"
              checked={editedRectangle.isActive}
              onCheckedChange={(checked) =>
                setEditedRectangle(prev => ({ ...prev, isActive: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="isCentrallyManaged">Zentral gesteuert</Label>
              <p className="text-sm text-muted-foreground">
                Über eine Kampagne verwalten
              </p>
            </div>
            <Switch
              id="isCentrallyManaged"
              checked={editedRectangle.isCentrallyManaged}
              onCheckedChange={(checked) =>
                setEditedRectangle(prev => ({ ...prev, isCentrallyManaged: checked }))
              }
            />
          </div>

          {editedRectangle.isCentrallyManaged && (
            <div className="space-y-2">
              <Label htmlFor="campaign">Kampagne</Label>
              <Select
                value={mockCampaigns.find(c => c.name === editedRectangle.campaignName)?.id || ''}
                onValueChange={handleCampaignChange}
              >
                <SelectTrigger id="campaign">
                  <SelectValue placeholder="Kampagne auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {mockCampaigns.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.name} ({campaign.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Bild-URL</Label>
            <Input
              id="imageUrl"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={editedRectangle.imageUrl || ''}
              onChange={(e) =>
                setEditedRectangle(prev => ({ ...prev, imageUrl: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetUrl">Ziel-URL</Label>
            <Input
              id="targetUrl"
              type="url"
              placeholder="/filme/action"
              value={editedRectangle.targetUrl || ''}
              onChange={(e) =>
                setEditedRectangle(prev => ({ ...prev, targetUrl: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedEvent">Eventverknüpfung</Label>
            <Select
              value={editedRectangle.linkedEventId?.toString() || 'none'}
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
            {editedRectangle.linkedEventId && (
              <p className="text-sm text-muted-foreground">
                Event-ID: {editedRectangle.linkedEventId}
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
