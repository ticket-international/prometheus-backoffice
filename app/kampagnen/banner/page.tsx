'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FiImage,
  FiEye,
  FiMousePointer,
  FiShoppingCart,
  FiDollarSign,
  FiTrendingUp,
  FiCalendar,
  FiTarget,
  FiPlay,
  FiPause,
  FiCheckCircle,
  FiMapPin,
  FiEdit2,
} from 'react-icons/fi';
import Image from 'next/image';
import { BannerCampaign, BannerApiItem } from '@/types/banners';
import { calculateBannerStats } from '@/lib/mockBanners';
import { fetchBanners } from '@/lib/bannersService';
import { useSite } from '@/lib/SiteContext';
import { BannerEditor } from '@/components/BannerEditor';

export default function KampagnenBannerPage() {
  const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'ended'>('active');
  const [banners, setBanners] = useState<(BannerCampaign & { apiItem: BannerApiItem })[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedSiteId, selectedWordpressId } = useSite();
  const [editingBanner, setEditingBanner] = useState<(BannerApiItem & { linkedEventId?: number; linkedEventName?: string }) | null>(null);

  useEffect(() => {
    async function loadBanners() {
      if (!selectedWordpressId) {
        console.log('No WordPress ID available for site');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await fetchBanners(selectedWordpressId);
        setBanners(data);
      } catch (error) {
        console.error('Failed to fetch banners:', error);
      } finally {
        setLoading(false);
      }
    }

    loadBanners();
  }, [selectedSiteId, selectedWordpressId]);

  const handleEditBanner = (banner: BannerCampaign & { apiItem: BannerApiItem }) => {
    setEditingBanner(banner.apiItem);
  };

  const handleSaveBanner = (updatedBanner: BannerApiItem & { linkedEventId?: number; linkedEventName?: string }) => {
    console.log('Saving banner:', updatedBanner);
    setEditingBanner(null);
  };

  const filteredBanners =
    filter === 'all'
      ? banners
      : banners.filter((banner) => banner.status === filter);

  const activeBanners = banners.filter((b) => b.status === 'active');
  const totalImpressions = activeBanners.reduce((sum, b) => sum + b.impressions, 0);
  const totalClicks = activeBanners.reduce((sum, b) => sum + b.clicks, 0);
  const totalConversions = activeBanners.reduce((sum, b) => sum + b.conversions, 0);
  const totalRevenue = activeBanners.reduce((sum, b) => sum + b.revenue, 0);

  const getStatusBadge = (status: BannerCampaign['status']) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-500 gap-1">
            <FiPlay size={12} />
            Aktiv
          </Badge>
        );
      case 'paused':
        return (
          <Badge variant="secondary" className="gap-1">
            <FiPause size={12} />
            Pausiert
          </Badge>
        );
      case 'ended':
        return (
          <Badge variant="outline" className="gap-1">
            <FiCheckCircle size={12} />
            Beendet
          </Badge>
        );
    }
  };

  const getTypeBadge = (type: BannerCampaign['type']) => {
    const labels = {
      film: 'Film',
      event: 'Event',
      promotion: 'Aktion',
    };
    return <Badge variant="outline">{labels[type]}</Badge>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('de-DE').format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Banner-Kampagnen</h1>
            <p className="text-sm text-muted-foreground">
              Verwaltung und Überwachung Ihrer Werbekampagnen
            </p>
          </div>
        </div>
        <Card className="p-12">
          <div className="text-center text-muted-foreground">
            <p className="text-lg">Lade Banner-Kampagnen...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Banner-Kampagnen</h1>
          <p className="text-sm text-muted-foreground">
            Verwaltung und Überwachung Ihrer Werbekampagnen
          </p>
        </div>
        <Button className="gap-2">
          <FiImage size={16} />
          Neue Kampagne erstellen
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Gesamt-Impressionen</p>
              <p className="text-2xl font-bold">{formatNumber(totalImpressions)}</p>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <FiEye size={20} className="text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Gesamt-Klicks</p>
              <p className="text-2xl font-bold">{formatNumber(totalClicks)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                CTR: {((totalClicks / totalImpressions) * 100).toFixed(2)}%
              </p>
            </div>
            <div className="p-2 bg-green-500/10 rounded-lg">
              <FiMousePointer size={20} className="text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Conversions</p>
              <p className="text-2xl font-bold">{formatNumber(totalConversions)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Rate: {((totalConversions / totalClicks) * 100).toFixed(2)}%
              </p>
            </div>
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <FiShoppingCart size={20} className="text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Gesamtumsatz</p>
              <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <FiDollarSign size={20} className="text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList>
          <TabsTrigger value="all">Alle</TabsTrigger>
          <TabsTrigger value="active" className="gap-2">
            <FiPlay size={14} />
            Aktiv ({banners.filter((b) => b.status === 'active').length})
          </TabsTrigger>
          <TabsTrigger value="paused" className="gap-2">
            <FiPause size={14} />
            Pausiert ({banners.filter((b) => b.status === 'paused').length})
          </TabsTrigger>
          <TabsTrigger value="ended" className="gap-2">
            <FiCheckCircle size={14} />
            Beendet ({banners.filter((b) => b.status === 'ended').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredBanners.map((banner) => {
              const stats = calculateBannerStats(banner);

              return (
                <Card key={banner.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="flex flex-col">
                    <div className="relative w-full aspect-[4/1] bg-muted">
                      <Image
                        src={banner.imageUrl}
                        alt={banner.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="p-4 space-y-4">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2">{banner.name}</h3>
                            <div className="flex flex-wrap gap-2">
                              {getStatusBadge(banner.status)}
                              {getTypeBadge(banner.type)}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => handleEditBanner(banner)}
                          >
                            <FiEdit2 size={14} />
                            Bearbeiten
                          </Button>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
                          <div className="flex items-center gap-1">
                            <FiCalendar size={12} />
                            <span>
                              {formatDate(banner.startDate)} - {formatDate(banner.endDate)}
                            </span>
                          </div>
                        </div>

                        {banner.targetAudience && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <FiTarget size={12} />
                            <span>{banner.targetAudience}</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                        <div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <FiEye size={12} />
                            Impressionen
                          </div>
                          <p className="text-lg font-bold">{formatNumber(banner.impressions)}</p>
                        </div>

                        <div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <FiMousePointer size={12} />
                            Klicks
                          </div>
                          <p className="text-lg font-bold">{formatNumber(banner.clicks)}</p>
                          <p className="text-xs text-muted-foreground">CTR: {stats.ctr.toFixed(2)}%</p>
                        </div>

                        <div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <FiShoppingCart size={12} />
                            Conversions
                          </div>
                          <p className="text-lg font-bold">{formatNumber(banner.conversions)}</p>
                          <p className="text-xs text-muted-foreground">
                            Rate: {stats.conversionRate.toFixed(2)}%
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <FiDollarSign size={12} />
                            Umsatz
                          </div>
                          <p className="text-lg font-bold">{formatCurrency(banner.revenue)}</p>
                          <p className="text-xs text-muted-foreground">
                            ROAS: {stats.roas.toFixed(2)}x
                          </p>
                        </div>
                      </div>

                      {banner.placement && banner.placement.length > 0 && (
                        <div className="pt-3 border-t">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                            <FiMapPin size={12} />
                            Platzierung
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {banner.placement.map((place) => (
                              <Badge key={place} variant="secondary" className="text-xs">
                                {place}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-3 border-t">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>Performance</span>
                          <span>{((banner.revenue / banner.budget) * 100).toFixed(0)}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all"
                            style={{
                              width: `${Math.min((banner.revenue / banner.budget) * 100, 100)}%`,
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                          <span>Budget: {formatCurrency(banner.budget)}</span>
                          <span className="flex items-center gap-1">
                            <FiTrendingUp size={12} />
                            ROI: {((stats.roas - 1) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {filteredBanners.length === 0 && (
        <Card className="p-12">
          <div className="text-center text-muted-foreground">
            <FiImage size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">Keine Kampagnen gefunden</p>
          </div>
        </Card>
      )}

      {editingBanner && (
        <BannerEditor
          banner={editingBanner}
          isOpen={!!editingBanner}
          onClose={() => setEditingBanner(null)}
          onSave={handleSaveBanner}
        />
      )}
    </div>
  );
}
