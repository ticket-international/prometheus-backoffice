'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Site } from '@/types/sites';

interface SiteContextType {
  selectedSiteId: number | null;
  selectedSiteName: string | null;
  selectedWordpressId: string | null;
  selectedWordpressUrl: string | null;
  sites: Site[];
  isAdmin: boolean;
  siteVersion: number;
  isLoadingSites: boolean;
  sitesError: string | null;
  setSites: (sites: Site[]) => void;
  setSelectedSite: (siteId: number, siteName: string) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  loadSites: (apiKey: string) => Promise<void>;
  retrySites: () => void;
  clearSites: () => void;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);
  const [selectedSiteName, setSelectedSiteName] = useState<string | null>(null);
  const [selectedWordpressId, setSelectedWordpressId] = useState<string | null>(null);
  const [selectedWordpressUrl, setSelectedWordpressUrl] = useState<string | null>(null);
  const [sites, setSitesState] = useState<Site[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [siteVersion, setSiteVersion] = useState(0);
  const [isLoadingSites, setIsLoadingSites] = useState(false);
  const [sitesError, setSitesError] = useState<string | null>(null);
  const [lastApiKey, setLastApiKey] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('site_context');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.selectedSiteId !== undefined) {
          setSelectedSiteId(parsed.selectedSiteId);
        }
        if (parsed.selectedSiteName) {
          setSelectedSiteName(parsed.selectedSiteName);
        }
        if (parsed.selectedWordpressId) {
          setSelectedWordpressId(parsed.selectedWordpressId);
        }
        if (parsed.selectedWordpressUrl) {
          setSelectedWordpressUrl(parsed.selectedWordpressUrl);
        }
        if (parsed.sites && Array.isArray(parsed.sites)) {
          setSitesState(parsed.sites);
        }
        if (parsed.isAdmin !== undefined) {
          setIsAdmin(parsed.isAdmin);
        }
      }
    } catch (error) {
      console.error('Failed to load site context:', error);
    }
  }, []);

  const setSites = useCallback((newSites: Site[]) => {
    setSitesState(newSites);

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('site_context');
        const current = stored ? JSON.parse(stored) : {};
        localStorage.setItem('site_context', JSON.stringify({
          ...current,
          sites: newSites,
        }));
      } catch (error) {
        console.error('Failed to save sites:', error);
      }
    }
  }, []);

  const setSelectedSite = useCallback((siteId: number, siteName: string) => {
    setSelectedSiteId(prevId => {
      if (prevId !== siteId) {
        setSiteVersion(v => v + 1);
      }
      return siteId;
    });

    setSelectedSiteName(siteName);

    const selectedSite = sites.find(site => site.siteid === siteId);
    const wordpressId = selectedSite?.keys?.find(key => key.name === 'WordpressID')?.value || null;
    const wordpressUrl = selectedSite?.keys?.find(key => key.name === 'WordpressURL')?.value || null;

    setSelectedWordpressId(wordpressId);
    setSelectedWordpressUrl(wordpressUrl);

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('site_context');
        const current = stored ? JSON.parse(stored) : {};
        localStorage.setItem('site_context', JSON.stringify({
          ...current,
          selectedSiteId: siteId,
          selectedSiteName: siteName,
          selectedWordpressId: wordpressId,
          selectedWordpressUrl: wordpressUrl,
        }));
      } catch (error) {
        console.error('Failed to save selected site:', error);
      }
    }
  }, [sites]);

  const setIsAdminInternal = useCallback((admin: boolean) => {
    setIsAdmin(admin);

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('site_context');
        const current = stored ? JSON.parse(stored) : {};
        localStorage.setItem('site_context', JSON.stringify({
          ...current,
          isAdmin: admin,
        }));
      } catch (error) {
        console.error('Failed to save admin status:', error);
      }
    }
  }, []);

  const loadSites = useCallback(async (apiKey: string) => {
    setIsLoadingSites(true);
    setSitesError(null);
    setLastApiKey(apiKey);

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/fetch-sites?apikey=${encodeURIComponent(apiKey)}`;

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || data.message || `Fehler ${response.status}`;
        throw new Error(errorMessage);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      let sitesArray: Site[] = [];

      if (data.sites && Array.isArray(data.sites)) {
        sitesArray = data.sites;
      } else if (data.items && Array.isArray(data.items)) {
        sitesArray = data.items;
      } else if (Array.isArray(data)) {
        sitesArray = data;
      } else {
        throw new Error('Ungültige Antwort vom Server: ' + JSON.stringify(data).substring(0, 100));
      }

      setSites(sitesArray);

      if (sitesArray.length > 0) {
        const storedSiteId = selectedSiteId;
        const siteExists = sitesArray.some((site: Site) => site.siteid === storedSiteId);

        if (isAdmin && !storedSiteId) {
          setSelectedSite(0, 'Alle');
        } else if (!siteExists || !storedSiteId) {
          const firstSite = sitesArray[0];
          setSelectedSite(firstSite.siteid, firstSite.name);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Fehler beim Laden der Standorte';
      setSitesError(errorMessage);
    } finally {
      setIsLoadingSites(false);
    }
  }, [isAdmin, selectedSiteId, setSites, setSelectedSite]);

  const retrySites = useCallback(() => {
    if (lastApiKey) {
      loadSites(lastApiKey);
    }
  }, [lastApiKey, loadSites]);

  const clearSites = useCallback(() => {
    setSelectedSiteId(null);
    setSelectedSiteName(null);
    setSelectedWordpressId(null);
    setSelectedWordpressUrl(null);
    setSitesState([]);
    setIsAdmin(false);
    setSiteVersion(0);
    setIsLoadingSites(false);
    setSitesError(null);
    setLastApiKey(null);

    if (typeof window !== 'undefined') {
      localStorage.removeItem('site_context');
    }
  }, []);

  return (
    <SiteContext.Provider
      value={{
        selectedSiteId,
        selectedSiteName,
        selectedWordpressId,
        selectedWordpressUrl,
        sites,
        isAdmin,
        siteVersion,
        isLoadingSites,
        sitesError,
        setSites,
        setSelectedSite,
        setIsAdmin: setIsAdminInternal,
        loadSites,
        retrySites,
        clearSites
      }}
    >
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const context = useContext(SiteContext);
  if (context === undefined) {
    throw new Error('useSite must be used within a SiteProvider');
  }
  return context;
}
