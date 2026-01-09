'use client';

import { useState, useEffect } from 'react';
import { FiShoppingCart, FiCalendar, FiRefreshCw, FiCheckCircle, FiXCircle, FiMail, FiClock, FiFilm } from 'react-icons/fi';
import { Transaction, OrderItem } from '@/types/orders';
import { fetchOrders } from '@/lib/api';
import OrderDetailFlyout from '@/components/OrderDetailFlyout';
import { useAuth } from '@/lib/AuthContext';
import { useSite } from '@/lib/SiteContext';

export default function Bestellungen() {
  const [orders, setOrders] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Transaction | null>(null);
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [emailFilter, setEmailFilter] = useState('alle');
  const [statusFilter, setStatusFilter] = useState('alle');
  const [kinoFilter, setKinoFilter] = useState('alle');
  const [filmFilter, setFilmFilter] = useState('alle');
  const [versionFilter, setVersionFilter] = useState('alle');
  const { session } = useAuth();
  const { selectedSiteId, siteVersion } = useSite();

  useEffect(() => {
    if (session && selectedSiteId) {
      loadOrders();
    }
  }, [session, selectedSiteId, siteVersion]);

  const loadOrders = async () => {
    if (!session || selectedSiteId === null) return;

    console.log('[Bestellungen] Loading orders for site:', selectedSiteId);

    setLoading(true);
    try {
      const data = await fetchOrders(
        { from: dateFrom || undefined, to: dateTo || undefined },
        session.apiKey,
        selectedSiteId === 0 ? undefined : selectedSiteId
      );
      console.log('[Bestellungen] Loaded', data.length, 'orders');
      setOrders(data);
    } catch (error) {
      console.error('[Bestellungen] Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (order: Transaction) => {
    setSelectedOrder(order);
    setIsFlyoutOpen(true);
  };

  const handleCloseFlyout = () => {
    setIsFlyoutOpen(false);
    setTimeout(() => setSelectedOrder(null), 300);
  };

  const handleFilterChange = () => {
    loadOrders();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    if (year === 1899 && month === 12 && day === 30) {
      return '';
    }

    return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();

    if (hours === 0 && minutes === 0) {
      return '';
    }

    return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateTime = (dateString: string) => {
    return `${formatDate(dateString)} ${formatTime(dateString)}`;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      BOOKED: 'badge badge-success',
      CANCELLED: 'badge badge-destructive',
      REFUNDED: 'badge badge-warning',
      PENDING: 'badge badge-soft',
    };
    const labels: Record<string, string> = {
      BOOKED: 'Gebucht',
      CANCELLED: 'Storniert',
      REFUNDED: 'Rückerstattet',
      PENDING: 'Ausstehend',
    };
    return (
      <span className={styles[status] || 'badge'}>
        {labels[status] || status}
      </span>
    );
  };

  const isMailOpened = (mailDebug: any) => {
    if (!mailDebug || !mailDebug.opened) return false;
    const openedDate = new Date(mailDebug.opened);
    return openedDate.getFullYear() > 1900;
  };

  const getItemColor = (itemType: string) => {
    switch (itemType.toLowerCase()) {
      case 'tickets':
        return 'text-foreground';
      case 'items':
      case 'combos':
        return 'text-chart-4';
      case 'vouchers':
        return 'text-chart-1';
      default:
        return 'text-foreground';
    }
  };

  const getItemStatusIcon = (item: OrderItem, orderState: string) => {
    if (orderState === 'CANCELLED' || item.refunded > 0) {
      return <FiXCircle className="text-destructive ml-1.5" size={14} />;
    }
    if (item.collected > 0) {
      return <FiCheckCircle className="text-chart-1 ml-1.5" size={14} />;
    }
    return <FiClock className="text-muted-foreground ml-1.5" size={14} />;
  };

  const displayCustomerName = (customer: string, email: string) => {
    if (customer.toLowerCase() === email.toLowerCase() || customer === email) {
      return email;
    }
    return customer;
  };

  const getEmailStatus = (order: Transaction) => {
    return order.mailSent > 0 ? 'Versendet' : 'Ausstehend';
  };

  const uniqueEmailStatuses = Array.from(new Set(orders.map(order => getEmailStatus(order)))).sort();
  const uniqueOrderStatuses = Array.from(new Set(orders.map(order => order.state))).sort();
  const uniqueKinos = Array.from(new Set(orders.map(order => order.siteName).filter(Boolean))).sort();
  const uniqueFilms = Array.from(new Set(orders.map(order => order.eventName).filter(Boolean))).sort();
  const uniqueVersions = Array.from(new Set(orders.map(order => order.version).filter(Boolean))).sort();

  const filteredOrders = orders.filter(order => {
    const matchesEmailFilter = emailFilter === 'alle' || getEmailStatus(order) === emailFilter;
    const matchesStatusFilter = statusFilter === 'alle' || order.state === statusFilter;
    const matchesKinoFilter = kinoFilter === 'alle' || order.siteName === kinoFilter;
    const matchesFilmFilter = filmFilter === 'alle' || order.eventName === filmFilter;
    const matchesVersionFilter = versionFilter === 'alle' || order.version === versionFilter;
    return matchesEmailFilter && matchesStatusFilter && matchesKinoFilter && matchesFilmFilter && matchesVersionFilter;
  });

  return (
    <>
      <div className="space-y-6 max-w-[1600px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FiShoppingCart className="text-xl text-foreground" />
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Bestellungen</h1>
          </div>
          <button
            onClick={loadOrders}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} size={16} />
            Aktualisieren
          </button>
        </div>

        <div className="card p-4 sm:p-5">
          <div className="flex items-center gap-3 mb-4">
            <FiCalendar className="text-muted-foreground" size={18} />
            <h2 className="text-sm font-medium tracking-tight">Filter</h2>
          </div>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Von</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm focus:ring-2 focus:ring-ring focus:border-ring transition-all"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Bis</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm focus:ring-2 focus:ring-ring focus:border-ring transition-all"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">E-Mail Status</label>
              <select
                value={emailFilter}
                onChange={(e) => setEmailFilter(e.target.value)}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm focus:ring-2 focus:ring-ring focus:border-ring transition-all"
              >
                <option value="alle">Alle</option>
                {uniqueEmailStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Bestellstatus</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm focus:ring-2 focus:ring-ring focus:border-ring transition-all"
              >
                <option value="alle">Alle</option>
                {uniqueOrderStatuses.map(status => {
                  const labels: Record<string, string> = {
                    BOOKED: 'Gebucht',
                    CANCELLED: 'Storniert',
                    REFUNDED: 'Rückerstattet',
                    PENDING: 'Ausstehend',
                  };
                  return (
                    <option key={status} value={status}>{labels[status] || status}</option>
                  );
                })}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Kino</label>
              <select
                value={kinoFilter}
                onChange={(e) => setKinoFilter(e.target.value)}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm focus:ring-2 focus:ring-ring focus:border-ring transition-all"
              >
                <option value="alle">Alle</option>
                {uniqueKinos.map(kino => (
                  <option key={kino} value={kino}>{kino}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Film</label>
              <select
                value={filmFilter}
                onChange={(e) => setFilmFilter(e.target.value)}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm focus:ring-2 focus:ring-ring focus:border-ring transition-all"
              >
                <option value="alle">Alle</option>
                {uniqueFilms.map(film => (
                  <option key={film} value={film}>{film}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Version</label>
              <select
                value={versionFilter}
                onChange={(e) => setVersionFilter(e.target.value)}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm focus:ring-2 focus:ring-ring focus:border-ring transition-all"
              >
                <option value="alle">Alle</option>
                {uniqueVersions.map(version => (
                  <option key={version} value={version}>{version}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleFilterChange}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-medium text-sm"
            >
              Filter anwenden
            </button>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                    Buchungsdatum
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                    Film
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                    Kunde
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                    Tickets
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                    Gesamtpreis
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                    E-Mail
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                    Gelesen
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground text-sm">
                      <FiRefreshCw className="animate-spin inline-block mr-2" size={16} />
                      Lade Bestellungen...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground text-sm">
                      Keine Bestellungen gefunden
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr
                      key={order.iD}
                      onClick={() => handleRowClick(order)}
                      className="hover:bg-muted/60 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="text-xs">
                          <div className="font-medium text-foreground">{formatDate(order.dtBook)}</div>
                          <div className="text-muted-foreground">{formatTime(order.dtBook)}</div>
                          {order.state === 'REFUNDED' && new Date(order.dtRefund).getFullYear() > 1900 && (
                            <div className="text-destructive text-[10px] mt-1">
                              Rückerstattet: {formatTime(order.dtRefund)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-2.5">
                          {(() => {
                            const hasOnlyVouchers = order.items.every(item => item.type === 'Vouchers');
                            const hasTickets = order.items.some(item => item.type === 'Tickets');

                            if (hasOnlyVouchers) {
                              return (
                                <img
                                  src="/grafik.png"
                                  alt="Gutschein"
                                  className="w-12 h-16 rounded-md border border-border object-cover flex-shrink-0"
                                />
                              );
                            } else if (hasTickets) {
                              return order.imageUrl ? (
                                <img
                                  src={order.imageUrl}
                                  alt={order.eventName}
                                  className="w-12 h-16 rounded-md border border-border object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-12 h-16 bg-gradient-to-br from-muted to-card rounded-md border border-border flex items-center justify-center flex-shrink-0">
                                  <FiFilm className="text-muted-foreground text-sm" />
                                </div>
                              );
                            }
                            return null;
                          })()}
                          <div>
                            <div className="text-xs font-medium text-foreground mb-0.5">
                              {order.eventName} {order.version && `(${order.version})`}
                            </div>
                            <div className="text-[10px] space-y-0.5">
                              {formatDate(order.showTime) && (
                                <div className="text-muted-foreground">{formatDate(order.showTime)}</div>
                              )}
                              {formatTime(order.showTime) && (
                                <div className="text-muted-foreground">{formatTime(order.showTime)}</div>
                              )}
                              <div className="text-muted-foreground">{order.screen}</div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs">
                          <div className="font-medium text-foreground">
                            {displayCustomerName(order.customer, order.email)}
                          </div>
                          {order.customer.toLowerCase() !== order.email.toLowerCase() && (
                            <div className="text-muted-foreground text-[10px] truncate max-w-[180px]">
                              {order.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-[10px] space-y-0.5">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center">
                              <span className={`font-medium ${getItemColor(item.type)}`}>
                                {item.count}x {item.name}
                              </span>
                              {getItemStatusIcon(item, order.state)}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs font-semibold text-foreground">
                          {order.amount.toFixed(2)} €
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(order.state)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {order.mailSent > 0 ? (
                            <>
                              <FiMail className="text-chart-1" size={14} />
                              <span className="text-[10px] text-chart-1">Versendet</span>
                            </>
                          ) : (
                            <>
                              <FiMail className="text-muted-foreground" size={14} />
                              <span className="text-[10px] text-muted-foreground">Ausstehend</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {isMailOpened(order.mailDebug) ? (
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <FiCheckCircle className="text-chart-1" size={14} />
                            </div>
                            <span className="text-[10px] text-muted-foreground mt-0.5">
                              {order.mailDebug && formatDateTime(order.mailDebug.opened)}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <FiXCircle className="text-muted-foreground" size={14} />
                            <span className="text-[10px] text-muted-foreground">Nicht gelesen</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-4">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground font-medium">Gesamt:</strong> {filteredOrders.length} von {orders.length} Bestellung(en)
          </p>
        </div>
      </div>

      <OrderDetailFlyout
        order={selectedOrder}
        isOpen={isFlyoutOpen}
        onClose={handleCloseFlyout}
      />
    </>
  );
}
