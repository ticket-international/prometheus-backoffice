'use client';

import { useState, useRef, useEffect } from 'react';
import { useSite } from '@/lib/SiteContext';
import { FiChevronDown, FiMapPin, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

export function SiteSelector() {
  const {
    selectedSiteId,
    selectedSiteName,
    sites,
    isAdmin,
    isLoadingSites,
    sitesError,
    setSelectedSite,
    retrySites
  } = useSite();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSite = (siteId: number, siteName: string) => {
    setSelectedSite(siteId, siteName);
    setIsOpen(false);
  };

  if (isLoadingSites) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-xs sm:text-sm">Standort</span>
        <div className="inline-flex items-center gap-2 rounded-md border border-border bg-popover px-3 py-1.5 text-xs shadow-sm">
          <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span className="font-medium">Laden...</span>
        </div>
      </div>
    );
  }

  if (sitesError) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs sm:text-sm">Standort</span>
          <div className="inline-flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-1.5 text-xs text-destructive">
            <FiAlertCircle size={14} />
            <span className="font-medium">Fehler</span>
            <button
              onClick={retrySites}
              className="ml-1 hover:opacity-70 transition-opacity"
              title="Erneut versuchen"
            >
              <FiRefreshCw size={14} />
            </button>
          </div>
        </div>
        <div className="text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded px-2 py-1.5 max-w-md">
          <strong>Details:</strong> {sitesError}
        </div>
      </div>
    );
  }

  const displaySites = isAdmin
    ? [{ siteid: 0, name: 'Alle' }, ...sites]
    : sites;

  if (displaySites.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-xs sm:text-sm">Standort</span>
        <div className="inline-flex items-center gap-2 rounded-md border border-border bg-popover px-3 py-1.5 text-xs shadow-sm">
          <span className="font-medium">Keine Standorte</span>
        </div>
      </div>
    );
  }

  if (displaySites.length === 1 && !isAdmin) {
    const site = displaySites[0];
    return (
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-xs sm:text-sm">Standort</span>
        <div className="inline-flex items-center gap-2 rounded-md border border-border bg-popover px-3 py-1.5 text-xs shadow-sm">
          <span className="inline-flex h-2 w-2 rounded-full bg-chart-1"></span>
          <span className="font-medium">{site.name}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2" ref={dropdownRef}>
      <span className="text-muted-foreground text-xs sm:text-sm">Standort</span>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-popover px-3 py-1.5 text-xs shadow-sm hover:bg-accent transition-colors"
        >
          <span className="inline-flex h-2 w-2 rounded-full bg-chart-1"></span>
          <span className="font-medium">{selectedSiteName || 'Bitte wählen'}</span>
          <FiChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-64 rounded-md border border-border bg-popover shadow-lg z-50 overflow-hidden">
            <div className="max-h-80 overflow-y-auto">
              {displaySites.map((site) => (
                <button
                  key={site.siteid}
                  onClick={() => handleSelectSite(site.siteid, site.name)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors
                    ${
                      selectedSiteId === site.siteid
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-accent text-foreground'
                    }
                  `}
                >
                  <FiMapPin
                    size={16}
                    className={selectedSiteId === site.siteid ? 'text-primary' : 'text-muted-foreground'}
                  />
                  <span className="flex-1 text-left truncate">{site.name}</span>
                  {selectedSiteId === site.siteid && (
                    <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
