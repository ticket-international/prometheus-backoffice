'use client';

import { Transaction, OrderItem } from '@/types/orders';
import { FiX, FiUser, FiFilm, FiMapPin, FiCheckCircle, FiXCircle, FiTag, FiDollarSign, FiClock, FiMail, FiCalendar, FiMonitor, FiSend, FiFileText, FiCreditCard, FiGift, FiRefreshCw } from 'react-icons/fi';

interface OrderDetailFlyoutProps {
  order: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderDetailFlyout({ order, isOpen, onClose }: OrderDetailFlyoutProps) {
  if (!isOpen || !order) return null;

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
      BOOKED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      CANCELLED: 'bg-red-500/15 text-red-400 border-red-500/30',
      REFUNDED: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      PENDING: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    };
    const labels: Record<string, string> = {
      BOOKED: 'Gebucht',
      CANCELLED: 'Storniert',
      REFUNDED: 'Rückerstattet',
      PENDING: 'Ausstehend',
    };
    return (
      <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${styles[status] || 'bg-muted text-muted-foreground'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const isMailOpened = (mailDebug: any) => {
    if (!mailDebug || !mailDebug.opened) return false;
    const openedDate = new Date(mailDebug.opened);
    return openedDate.getFullYear() > 1900;
  };

  const getItemType = (itemName: string): 'ticket' | 'article' | 'voucher' => {
    const ticketKeywords = ['normal', 'ermäßigt', 'kind', 'senior', 'student', 'vip', 'erwachsen', 'ticket'];
    const voucherKeywords = ['gutschein', 'voucher', 'rabatt', 'coupon', 'stornogutschein'];
    const articleKeywords = ['popcorn', 'nacho', 'menu', 'menü'];

    const lowerName = itemName.toLowerCase();

    if (voucherKeywords.some(keyword => lowerName.includes(keyword))) {
      return 'voucher';
    }

    if (articleKeywords.some(keyword => lowerName.includes(keyword))) {
      return 'article';
    }

    if (ticketKeywords.some(keyword => lowerName.includes(keyword))) {
      return 'ticket';
    }

    return 'article';
  };

  const getItemColor = (itemName: string) => {
    const type = getItemType(itemName);
    switch (type) {
      case 'ticket':
        return 'text-blue-400';
      case 'article':
        return 'text-amber-400';
      case 'voucher':
        return 'text-emerald-400';
    }
  };

  const getItemBgColor = (itemName: string) => {
    const type = getItemType(itemName);
    switch (type) {
      case 'ticket':
        return 'bg-blue-500/10 border-blue-500/20';
      case 'article':
        return 'bg-amber-500/10 border-amber-500/20';
      case 'voucher':
        return 'bg-emerald-500/10 border-emerald-500/20';
    }
  };

  const getItemStatusIcon = (item: OrderItem, orderState: string) => {
    if (orderState === 'CANCELLED' || item.refunded > 0) {
      return <FiXCircle className="text-red-400" size={18} />;
    }
    if (item.collected > 0) {
      return <FiCheckCircle className="text-emerald-400" size={18} />;
    }
    return <FiClock className="text-muted-foreground" size={18} />;
  };

  const displayCustomerInfo = (customer: string, email: string) => {
    if (customer.toLowerCase() === email.toLowerCase() || customer === email) {
      return { name: email, showEmail: false };
    }
    return { name: customer, showEmail: true };
  };

  const customerInfo = displayCustomerInfo(order.customer, order.email);

  const tickets = order.items.filter(item => getItemType(item.name) === 'ticket');
  const articles = order.items.filter(item => getItemType(item.name) === 'article');
  const vouchers = order.items.filter(item => getItemType(item.name) === 'voucher');

  const handleResendEmail = () => {
    console.log('Resending confirmation email for order:', order.iD);
  };

  const handleShowTicket = () => {
    console.log('Showing e-ticket for order:', order.iD);
  };

  const handleShowInvoice = () => {
    console.log('Showing invoice for order:', order.iD);
  };

  const handleCancelWithVoucher = () => {
    console.log('Cancelling with voucher for order:', order.iD);
  };

  const handleCancelWithRefund = () => {
    console.log('Cancelling with refund for order:', order.iD);
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="relative w-full max-w-5xl max-h-[95vh] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden pointer-events-auto animate-in zoom-in-95 duration-200">

          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2.5 bg-background/80 hover:bg-background backdrop-blur-md rounded-xl transition-all border border-border shadow-lg"
          >
            <FiX size={20} className="text-foreground" />
          </button>

          <div className="overflow-y-auto max-h-[95vh]">
            <div className="relative h-[500px] overflow-hidden">
              {(() => {
                const hasOnlyVouchers = order.items.every(item => getItemType(item.name) === 'voucher');
                const imageSource = hasOnlyVouchers
                  ? "/grafik.png"
                  : (order.imageUrl || "https://image.tmdb.org/t/p/original/7nfpkR9XsQ1lBNCXSSHxGV7Dkxe.jpg");

                return (
                  <img
                    src={imageSource}
                    alt={hasOnlyVouchers ? "Gutschein" : order.eventName}
                    className="w-full h-full object-cover object-top"
                  />
                );
              })()}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-card" />
              <div className="absolute bottom-0 left-0 right-0 p-8 pb-6">
                <h2 className="text-4xl font-bold text-foreground drop-shadow-lg">{order.eventName}</h2>
              </div>
            </div>

            <div className="p-8 pt-4 space-y-6">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {order.version && (
                      <span className="inline-block px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium">
                        {order.version}
                      </span>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <FiTag className="text-primary" size={16} />
                      <span className="font-mono text-xs">{order.iD}</span>
                    </div>
                  </div>
                  {getStatusBadge(order.state)}
                </div>
              </div>

              <div className="card p-4 bg-muted/30">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleResendEmail}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg transition-all text-sm font-medium"
                    title="Bestätigungs-E-Mail neu senden"
                  >
                    <FiSend size={16} />
                    <span className="hidden sm:inline">E-Mail senden</span>
                  </button>
                  <button
                    onClick={handleShowTicket}
                    className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg transition-all text-sm font-medium"
                    title="E-Ticket anzeigen"
                  >
                    <FiCreditCard size={16} />
                    <span className="hidden sm:inline">E-Ticket</span>
                  </button>
                  <button
                    onClick={handleShowInvoice}
                    className="flex items-center gap-2 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg transition-all text-sm font-medium"
                    title="Rechnung anzeigen"
                  >
                    <FiFileText size={16} />
                    <span className="hidden sm:inline">Rechnung</span>
                  </button>
                  <button
                    onClick={handleCancelWithVoucher}
                    className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-lg transition-all text-sm font-medium"
                    title="Storniere gegen Gutschein"
                  >
                    <FiGift size={16} />
                    <span className="hidden sm:inline">Gutschein</span>
                  </button>
                  <button
                    onClick={handleCancelWithRefund}
                    className="flex items-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-all text-sm font-medium"
                    title="Storno mit Rückzahlung"
                  >
                    <FiRefreshCw size={16} />
                    <span className="hidden sm:inline">Rückzahlung</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card p-5 space-y-4">
                  <div className="flex items-center gap-3 text-foreground font-semibold">
                    <FiCalendar className="text-primary" size={20} />
                    <span>Vorstellungsinformationen</span>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="text-muted-foreground mb-1">Datum & Uhrzeit</div>
                      <div className="text-foreground font-medium">
                        {formatDate(order.showTime)} {formatTime(order.showTime) && `• ${formatTime(order.showTime)}`}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Kinosaal</div>
                      <div className="text-foreground font-medium flex items-center gap-2">
                        <FiMonitor size={16} />
                        {order.screen}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card p-5 space-y-4">
                  <div className="flex items-center gap-3 text-foreground font-semibold">
                    <FiMapPin className="text-primary" size={20} />
                    <span>Standort</span>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="text-muted-foreground mb-1">Kino</div>
                      <div className="text-foreground font-medium">{order.siteName}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Site-ID: {order.siteID} • Company-ID: {order.companyID}
                    </div>
                  </div>
                </div>

                <div className="card p-5 space-y-4">
                  <div className="flex items-center gap-3 text-foreground font-semibold">
                    <FiUser className="text-primary" size={20} />
                    <span>Kunde</span>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="text-muted-foreground mb-1">
                        {customerInfo.showEmail ? 'Name' : 'E-Mail'}
                      </div>
                      <div className="text-foreground font-medium break-words">{customerInfo.name}</div>
                    </div>
                    {customerInfo.showEmail && (
                      <div>
                        <div className="text-muted-foreground mb-1">E-Mail</div>
                        <div className="text-foreground font-medium break-words">{order.email}</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card p-5 space-y-4">
                  <div className="flex items-center gap-3 text-foreground font-semibold">
                    <FiClock className="text-primary" size={20} />
                    <span>Buchungsinformationen</span>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="text-muted-foreground mb-1">Buchungsdatum</div>
                      <div className="text-foreground font-medium">
                        {formatDate(order.dtBook)} • {formatTime(order.dtBook)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Zahlungsdatum</div>
                      <div className="text-foreground font-medium">
                        {formatDate(order.dtPay)} • {formatTime(order.dtPay)}
                      </div>
                    </div>
                    {order.state === 'REFUNDED' && new Date(order.dtRefund).getFullYear() > 1900 && (
                      <div>
                        <div className="text-muted-foreground mb-1">Rückerstattung</div>
                        <div className="text-red-400 font-medium">{formatDateTime(order.dtRefund)}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {tickets.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-foreground font-semibold">
                    <FiFilm className="text-primary" size={20} />
                    <span>Tickets</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {tickets.map((item, idx) => (
                      <div key={idx} className={`rounded-xl p-4 border ${getItemBgColor(item.name)}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className={`font-semibold text-base ${getItemColor(item.name)} mb-1`}>
                              {item.name}
                            </div>
                            <div className="text-sm text-muted-foreground">Anzahl: {item.count}</div>
                          </div>
                          {getItemStatusIcon(item, order.state)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {articles.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-foreground font-semibold">
                    <FiDollarSign className="text-primary" size={20} />
                    <span>Concessions</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {articles.map((item, idx) => (
                      <div key={idx} className={`rounded-xl p-4 border ${getItemBgColor(item.name)}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className={`font-semibold text-base ${getItemColor(item.name)} mb-1`}>
                              {item.name}
                            </div>
                            <div className="text-sm text-muted-foreground">Anzahl: {item.count}</div>
                          </div>
                          {getItemStatusIcon(item, order.state)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {vouchers.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-foreground font-semibold">
                    <FiTag className="text-primary" size={20} />
                    <span>Gutscheine</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {vouchers.map((item, idx) => (
                      <div key={idx} className={`rounded-xl p-4 border ${getItemBgColor(item.name)}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className={`font-semibold text-base ${getItemColor(item.name)} mb-1`}>
                              {item.name}
                            </div>
                            <div className="text-sm text-muted-foreground">Anzahl: {item.count}</div>
                          </div>
                          {getItemStatusIcon(item, order.state)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-foreground font-semibold">
                  <FiMail className="text-primary" size={20} />
                  <span>E-Mail Status</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="card p-4">
                    <div className="text-sm text-muted-foreground mb-2">Versandstatus</div>
                    {order.mailSent > 0 ? (
                      <div className="flex items-center gap-2">
                        <FiCheckCircle className="text-emerald-400" size={18} />
                        <span className="text-foreground font-medium">Versendet</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <FiXCircle className="text-muted-foreground" size={18} />
                        <span className="text-foreground font-medium">Nicht versendet</span>
                      </div>
                    )}
                  </div>
                  <div className="card p-4">
                    <div className="text-sm text-muted-foreground mb-2">Lesestatus</div>
                    {isMailOpened(order.mailDebug) ? (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <FiCheckCircle className="text-emerald-400" size={18} />
                          <span className="text-foreground font-medium">Gelesen</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {order.mailDebug && formatDateTime(order.mailDebug.opened)}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <FiXCircle className="text-muted-foreground" size={18} />
                        <span className="text-foreground font-medium">Nicht gelesen</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="card bg-primary/5 border-primary/20 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FiDollarSign className="text-primary" size={24} />
                    <span className="text-lg font-semibold text-foreground">Gesamtbetrag</span>
                  </div>
                  <div className="text-3xl font-bold text-foreground">
                    {order.amount.toFixed(2)} €
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
