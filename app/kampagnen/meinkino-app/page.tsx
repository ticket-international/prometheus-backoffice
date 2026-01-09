'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FiSmartphone,
  FiRepeat,
  FiClock,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSend,
  FiCalendar,
  FiBell,
  FiHeart,
  FiShoppingCart,
  FiAlertCircle,
} from 'react-icons/fi';
import { RecurringCampaign, OnetimeCampaign } from '@/types/appCampaigns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const getCampaignIcon = (type: string) => {
  switch (type) {
    case 'watch_list_starts':
      return FiHeart;
    case 'new_films_favorite_cinemas':
      return FiClock;
    case 'ticket_reminder':
      return FiBell;
    case 'program_changes':
      return FiAlertCircle;
    case 'article_sale_reminder':
      return FiShoppingCart;
    default:
      return FiBell;
  }
};

export default function MeinKinoAppPage() {
  const [recurringCampaigns, setRecurringCampaigns] = useState<RecurringCampaign[]>([]);
  const [onetimeCampaigns, setOnetimeCampaigns] = useState<OnetimeCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    target_audience: 'all',
    scheduled_date: '',
  });

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    setIsLoading(true);
    try {
      const [recurringData, onetimeData] = await Promise.all([
        supabase.from('app_recurring_campaigns').select('*').order('name'),
        supabase
          .from('app_onetime_campaigns')
          .select('*')
          .order('created_at', { ascending: false }),
      ]);

      if (recurringData.data) {
        setRecurringCampaigns(recurringData.data);
      }

      if (onetimeData.data) {
        setOnetimeCampaigns(onetimeData.data);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Kampagnen:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecurringCampaign = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('app_recurring_campaigns')
        .update({ is_enabled: !currentStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setRecurringCampaigns((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_enabled: !currentStatus } : c))
      );
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Kampagne:', error);
    }
  };

  const handleCreateCampaign = async () => {
    try {
      const { error } = await supabase.from('app_onetime_campaigns').insert([
        {
          name: newCampaign.name,
          description: newCampaign.description,
          target_audience: newCampaign.target_audience,
          scheduled_date: newCampaign.scheduled_date || null,
          status: newCampaign.scheduled_date ? 'scheduled' : 'draft',
        },
      ]);

      if (error) throw error;

      setShowCreateDialog(false);
      setNewCampaign({ name: '', description: '', target_audience: 'all', scheduled_date: '' });
      loadCampaigns();
    } catch (error) {
      console.error('Fehler beim Erstellen der Kampagne:', error);
    }
  };

  const deleteCampaign = async (id: string) => {
    if (!confirm('Möchten Sie diese Kampagne wirklich löschen?')) return;

    try {
      const { error } = await supabase.from('app_onetime_campaigns').delete().eq('id', id);

      if (error) throw error;

      loadCampaigns();
    } catch (error) {
      console.error('Fehler beim Löschen der Kampagne:', error);
    }
  };

  const getStatusBadge = (status: OnetimeCampaign['status']) => {
    switch (status) {
      case 'sent':
        return (
          <Badge variant="default" className="bg-green-500">
            Versendet
          </Badge>
        );
      case 'scheduled':
        return (
          <Badge variant="default" className="bg-blue-500">
            Eingeplant
          </Badge>
        );
      case 'draft':
        return <Badge variant="secondary">Entwurf</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <Card className="p-12">
          <p className="text-center text-muted-foreground">Lade Kampagnen...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
            <FiSmartphone size={28} />
            MeinKino App Kampagnen
          </h1>
          <p className="text-sm text-muted-foreground">
            Verwalten Sie Push-Benachrichtigungen und Kampagnen für die MeinKino App
          </p>
        </div>
      </div>

      <Tabs defaultValue="recurring" className="space-y-6">
        <TabsList>
          <TabsTrigger value="recurring" className="gap-2">
            <FiRepeat size={16} />
            Wiederkehrende Kampagnen
          </TabsTrigger>
          <TabsTrigger value="onetime" className="gap-2">
            <FiClock size={16} />
            Einmalige Kampagnen
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recurring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automatische Benachrichtigungen</CardTitle>
              <CardDescription>
                Aktivieren oder deaktivieren Sie wiederkehrende Push-Benachrichtigungen für App-Nutzer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recurringCampaigns.map((campaign) => {
                const Icon = getCampaignIcon(campaign.campaign_type);
                return (
                  <div
                    key={campaign.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon size={20} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-base">{campaign.name}</h3>
                        <p className="text-sm text-muted-foreground">{campaign.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {campaign.is_enabled && (
                        <Badge variant="default" className="bg-green-500">
                          Aktiv
                        </Badge>
                      )}
                      <Switch
                        checked={campaign.is_enabled}
                        onCheckedChange={() =>
                          toggleRecurringCampaign(campaign.id, campaign.is_enabled)
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="onetime" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
              <FiPlus size={16} />
              Neue Kampagne erstellen
            </Button>
          </div>

          {onetimeCampaigns.length === 0 ? (
            <Card className="p-12">
              <div className="text-center text-muted-foreground">
                <FiClock size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Keine einmaligen Kampagnen vorhanden</p>
                <p className="text-sm">
                  Erstellen Sie Ihre erste Kampagne für gezielte Push-Benachrichtigungen
                </p>
                <Button className="mt-4" onClick={() => setShowCreateDialog(true)}>
                  Kampagne erstellen
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4">
              {onetimeCampaigns.map((campaign) => (
                <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{campaign.name}</h3>
                          {getStatusBadge(campaign.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {campaign.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {campaign.scheduled_date && (
                            <div className="flex items-center gap-2">
                              <FiCalendar size={14} />
                              <span>
                                {new Date(campaign.scheduled_date).toLocaleDateString('de-DE', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <FiSmartphone size={14} />
                            <span>
                              {campaign.recipient_count > 0
                                ? `${campaign.recipient_count.toLocaleString('de-DE')} Empfänger`
                                : 'Noch keine Empfänger'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <FiEdit size={16} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteCampaign(campaign.id)}
                        >
                          <FiTrash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neue einmalige Kampagne erstellen</DialogTitle>
            <DialogDescription>
              Erstellen Sie eine gezielte Push-Benachrichtigung für App-Nutzer
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Kampagnenname</Label>
              <Input
                id="name"
                placeholder="z.B. Sommer-Special Aktion"
                value={newCampaign.name}
                onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Nachrichtentext</Label>
              <Textarea
                id="description"
                placeholder="Text der Push-Benachrichtigung..."
                rows={3}
                value={newCampaign.description}
                onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="audience">Zielgruppe</Label>
              <Select
                value={newCampaign.target_audience}
                onValueChange={(value) =>
                  setNewCampaign({ ...newCampaign, target_audience: value })
                }
              >
                <SelectTrigger id="audience">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle App-Nutzer</SelectItem>
                  <SelectItem value="active">Aktive Nutzer (30 Tage)</SelectItem>
                  <SelectItem value="inactive">Inaktive Nutzer (90 Tage)</SelectItem>
                  <SelectItem value="favorite_cinema">Nutzer mit Lieblingskinos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduled">Sendezeitpunkt (optional)</Label>
              <Input
                id="scheduled"
                type="datetime-local"
                value={newCampaign.scheduled_date}
                onChange={(e) =>
                  setNewCampaign({ ...newCampaign, scheduled_date: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Leer lassen für sofortigen Versand oder als Entwurf speichern
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Abbrechen
            </Button>
            <Button
              onClick={handleCreateCampaign}
              disabled={!newCampaign.name || !newCampaign.description}
              className="gap-2"
            >
              <FiSend size={16} />
              {newCampaign.scheduled_date ? 'Einplanen' : 'Als Entwurf speichern'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
