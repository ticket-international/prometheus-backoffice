'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FiEdit2, FiEye, FiEyeOff, FiImage, FiSave, FiRefreshCw } from 'react-icons/fi';
import { Rectangle } from '@/types/rectangles';
import { RectangleEditor } from '@/components/RectangleEditor';
import { fetchRectangles } from '@/lib/rectanglesService';
import { useSite } from '@/lib/SiteContext';

export default function KampagnenRectanglesPage() {
  const { selectedSiteId, selectedWordpressId } = useSite();
  const [rectangles, setRectangles] = useState<Rectangle[]>([]);
  const [selectedRectangle, setSelectedRectangle] = useState<Rectangle | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedSiteId !== null && selectedWordpressId) {
      loadRectangles();
    }
  }, [selectedSiteId, selectedWordpressId]);

  const loadRectangles = async () => {
    if (selectedSiteId === null || !selectedWordpressId) {
      console.log('No WordPress ID available for site');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchRectangles(selectedWordpressId);
      setRectangles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rectangles');
      console.error('Error loading rectangles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (rectangle: Rectangle) => {
    setSelectedRectangle(rectangle);
    setIsEditorOpen(true);
  };

  const handleSave = (updatedRectangle: Rectangle) => {
    setRectangles(
      rectangles.map((rect) =>
        rect.id === updatedRectangle.id ? updatedRectangle : rect
      )
    );
  };

  const handleToggleActive = (id: number) => {
    setRectangles(
      rectangles.map((rect) =>
        rect.id === id ? { ...rect, isActive: !rect.isActive } : rect
      )
    );
  };

  const rows = [
    rectangles.slice(0, 4),
    rectangles.slice(4, 8),
    rectangles.slice(8, 12),
  ];

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FiRefreshCw className="animate-spin mx-auto mb-2" size={32} />
          <p className="text-muted-foreground">Lade Rectangles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="p-6 text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={loadRectangles}>
            <FiRefreshCw size={16} className="mr-2" />
            Erneut versuchen
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Rectangle-Kampagnen</h1>
          <p className="text-sm text-muted-foreground">
            Verwalten Sie 12 Kacheln (3 Reihen × 4 Kacheln) auf Ihrer Webseite
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={loadRectangles}>
            <FiRefreshCw size={16} />
            Aktualisieren
          </Button>
          <Button variant="outline" className="gap-2">
            <FiSave size={16} />
            Alle speichern
          </Button>
          <Button className="gap-2">
            <FiImage size={16} />
            Vorschau
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Kachel-Übersicht</h2>
          <div className="flex gap-2 text-sm text-muted-foreground">
            <span>{rectangles.filter((r) => r.isActive).length} aktiv</span>
            <span>•</span>
            <span>{rectangles.filter((r) => r.isCentrallyManaged).length} zentral gesteuert</span>
          </div>
        </div>

        <div className="space-y-4">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {row.map((rectangle) => (
                <Card
                  key={rectangle.id}
                  className={`relative overflow-hidden transition-all ${
                    !rectangle.isActive ? 'opacity-50' : ''
                  }`}
                >
                  <div className="relative aspect-[3/2] bg-muted">
                    {rectangle.imageUrl ? (
                      <img
                        src={rectangle.imageUrl}
                        alt={`Kachel ${rectangle.position}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          <FiImage size={32} className="mx-auto mb-2 opacity-50" />
                          <p className="text-xs">Kein Bild</p>
                        </div>
                      </div>
                    )}

                    <div className="absolute top-2 left-2 flex gap-1">
                      <Badge variant="secondary" className="text-xs">
                        #{rectangle.position}
                      </Badge>
                      {rectangle.isCentrallyManaged && (
                        <Badge variant="default" className="text-xs bg-chart-2">
                          Zentral
                        </Badge>
                      )}
                    </div>

                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-7 w-7 p-0"
                        onClick={() => handleToggleActive(rectangle.id)}
                      >
                        {rectangle.isActive ? (
                          <FiEye size={14} />
                        ) : (
                          <FiEyeOff size={14} />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-7 w-7 p-0"
                        onClick={() => handleEdit(rectangle)}
                      >
                        <FiEdit2 size={14} />
                      </Button>
                    </div>
                  </div>

                  <div className="p-3 space-y-2">
                    {rectangle.title && (
                      <div className="text-sm font-medium truncate" title={rectangle.title}>
                        {rectangle.title}
                      </div>
                    )}

                    {rectangle.isCentrallyManaged && rectangle.campaignName && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Kampagne:</span>
                        <Badge variant="outline" className="text-xs">
                          {rectangle.campaignName}
                        </Badge>
                      </div>
                    )}

                    {rectangle.targetUrl && (
                      <div className="text-xs text-muted-foreground truncate">
                        <span className="font-medium">Ziel:</span> {rectangle.targetUrl}
                      </div>
                    )}

                    {rectangle.linkType && rectangle.linkType !== 'none' && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Verknüpft:</span>
                        <Badge variant="secondary" className="text-xs">
                          {rectangle.linkType === 'film' && 'Film'}
                          {rectangle.linkType === 'showing' && 'Vorstellung'}
                          {rectangle.linkType === 'attribute' && `${rectangle.linkedAttributeType}`}
                        </Badge>
                      </div>
                    )}

                    {!rectangle.isActive && (
                      <div className="text-xs text-muted-foreground italic">
                        Nicht aktiv
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Legende</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-chart-2/20 rounded-lg">
              <Badge variant="default" className="text-xs bg-chart-2">
                Zentral
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium">Zentral gesteuert</p>
              <p className="text-xs text-muted-foreground">
                Kachel wird über eine Kampagne verwaltet
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <FiEye size={20} className="text-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">Aktiv</p>
              <p className="text-xs text-muted-foreground">
                Kachel wird auf der Webseite angezeigt
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <FiEdit2 size={20} className="text-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">Bearbeiten</p>
              <p className="text-xs text-muted-foreground">
                Einstellungen der Kachel anpassen
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-chart-1/20 rounded-lg">
              <Badge variant="secondary" className="text-xs">
                Film
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium">Film-Verknüpfung</p>
              <p className="text-xs text-muted-foreground">
                Direkte Verlinkung zu einem Film
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-chart-3/20 rounded-lg">
              <Badge variant="secondary" className="text-xs">
                Vorstellung
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium">Vorstellungs-Verknüpfung</p>
              <p className="text-xs text-muted-foreground">
                Direkte Verlinkung zu einer Vorstellung
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-chart-4/20 rounded-lg">
              <Badge variant="secondary" className="text-xs">
                Attribut
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium">Attribut-Verknüpfung</p>
              <p className="text-xs text-muted-foreground">
                Verlinkung zu Genre, Schauspieler oder Regisseur
              </p>
            </div>
          </div>
        </div>
      </Card>

      {selectedRectangle && (
        <RectangleEditor
          rectangle={selectedRectangle}
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
