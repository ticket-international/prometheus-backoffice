import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const MATOMO_BASE_URL = "https://matomo.cinster.online/";
const MATOMO_TOKEN = "5e73431ecb34d4d0b1870f361a9a7a64";

const siteIdToMatomoId: Record<number, number> = {
  100010: 2,
  100012: 3,
  100066: 4,
  100067: 5,
  100068: 6,
  100069: 7,
  100121: 8,
  100126: 9,
  100138: 10,
  100209: 11,
  100026: 12,
  100203: 14,
  100197: 15,
  100022: 16,
  100023: 17,
  100025: 18,
  100027: 19,
  100046: 20,
  100048: 21,
  100094: 22,
  100091: 23,
  100092: 24,
  100093: 25,
  100319: 31,
  100331: 30,
  100359: 34,
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const siteId = url.searchParams.get('siteid');

    let matomoSiteId: number | string = 'all';
    if (siteId && siteId !== '0') {
      const siteIdNum = parseInt(siteId, 10);
      matomoSiteId = siteIdToMatomoId[siteIdNum] || siteIdNum;
    }

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const callMatomoApi = (method: string, period: string, date: string, additionalParams: Record<string, string> = {}) => {
      const params = new URLSearchParams({
        module: 'API',
        method,
        idSite: matomoSiteId.toString(),
        period,
        date,
        format: 'json',
        token_auth: MATOMO_TOKEN,
        ...additionalParams,
      });

      return fetch(MATOMO_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });
    };

    console.log('Fetching Matomo stats for site:', matomoSiteId);

    const last7Days = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    const last30Days = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

    const [
      visitsSummaryToday,
      visitsSummaryYesterday,
      deviceTypes,
      topPages,
      visitsSummaryLast7Days,
      visitsSummaryLast30Days,
      referrers,
      browsers,
      operatingSystems,
      countries,
      entryPages,
      exitPages,
      visitsByHour,
      visitorTypes
    ] = await Promise.all([
      callMatomoApi('VisitsSummary.get', 'day', today),
      callMatomoApi('VisitsSummary.get', 'day', yesterday),
      callMatomoApi('DevicesDetection.getType', 'day', today),
      callMatomoApi('Actions.getPageUrls', 'day', today, { filter_limit: '10' }),
      callMatomoApi('VisitsSummary.get', 'range', `${last7Days},${today}`),
      callMatomoApi('VisitsSummary.get', 'range', `${last30Days},${today}`),
      callMatomoApi('Referrers.getAll', 'day', today, { filter_limit: '10' }),
      callMatomoApi('DevicesDetection.getBrowsers', 'day', today, { filter_limit: '5' }),
      callMatomoApi('DevicesDetection.getOsVersions', 'day', today, { filter_limit: '5' }),
      callMatomoApi('UserCountry.getCountry', 'day', today, { filter_limit: '10' }),
      callMatomoApi('Actions.getEntryPageUrls', 'day', today, { filter_limit: '10' }),
      callMatomoApi('Actions.getExitPageUrls', 'day', today, { filter_limit: '10' }),
      callMatomoApi('VisitsSummary.getVisitInformationPerServerTime', 'day', today),
      callMatomoApi('VisitsSummary.get', 'day', today, { segment: 'visitorType==new' })
    ]);

    const responses = [
      visitsSummaryToday,
      visitsSummaryYesterday,
      deviceTypes,
      topPages,
      visitsSummaryLast7Days,
      visitsSummaryLast30Days,
      referrers,
      browsers,
      operatingSystems,
      countries,
      entryPages,
      exitPages,
      visitsByHour,
      visitorTypes
    ];

    for (let i = 0; i < responses.length; i++) {
      if (!responses[i].ok) {
        const errorText = await responses[i].text();
        console.error(`Response ${i} error:`, errorText);
      }
    }

    const [
      todayData,
      yesterdayData,
      devicesData,
      pagesData,
      last7DaysData,
      last30DaysData,
      referrersData,
      browsersData,
      osData,
      countriesData,
      entryPagesData,
      exitPagesData,
      visitsByHourData,
      visitorTypesData
    ] = await Promise.all([
      visitsSummaryToday.ok ? visitsSummaryToday.json() : {},
      visitsSummaryYesterday.ok ? visitsSummaryYesterday.json() : {},
      deviceTypes.ok ? deviceTypes.json() : [],
      topPages.ok ? topPages.json() : [],
      visitsSummaryLast7Days.ok ? visitsSummaryLast7Days.json() : {},
      visitsSummaryLast30Days.ok ? visitsSummaryLast30Days.json() : {},
      referrers.ok ? referrers.json() : [],
      browsers.ok ? browsers.json() : [],
      operatingSystems.ok ? operatingSystems.json() : [],
      countries.ok ? countries.json() : [],
      entryPages.ok ? entryPages.json() : [],
      exitPages.ok ? exitPages.json() : [],
      visitsByHour.ok ? visitsByHour.json() : [],
      visitorTypes.ok ? visitorTypes.json() : {}
    ]);

    const result = {
      today: {
        pageviews: todayData.nb_actions || 0,
        visits: todayData.nb_visits || 0,
        uniqueVisitors: todayData.nb_uniq_visitors || 0,
        bounceRate: todayData.bounce_rate ? parseFloat(todayData.bounce_rate) : 0,
        avgTimeOnSite: todayData.avg_time_on_site || 0,
      },
      yesterday: {
        pageviews: yesterdayData.nb_actions || 0,
        visits: yesterdayData.nb_visits || 0,
        uniqueVisitors: yesterdayData.nb_uniq_visitors || 0,
      },
      last7Days: {
        pageviews: last7DaysData.nb_actions || 0,
        visits: last7DaysData.nb_visits || 0,
        uniqueVisitors: last7DaysData.nb_uniq_visitors || 0,
        bounceRate: last7DaysData.bounce_rate ? parseFloat(last7DaysData.bounce_rate) : 0,
        avgTimeOnSite: last7DaysData.avg_time_on_site || 0,
      },
      last30Days: {
        pageviews: last30DaysData.nb_actions || 0,
        visits: last30DaysData.nb_visits || 0,
        uniqueVisitors: last30DaysData.nb_uniq_visitors || 0,
        bounceRate: last30DaysData.bounce_rate ? parseFloat(last30DaysData.bounce_rate) : 0,
        avgTimeOnSite: last30DaysData.avg_time_on_site || 0,
      },
      devices: Array.isArray(devicesData) ? devicesData.map((device: any) => ({
        label: device.label || 'Unknown',
        visits: device.nb_visits || 0,
        percentage: device.nb_visits && todayData.nb_visits
          ? ((device.nb_visits / todayData.nb_visits) * 100).toFixed(1)
          : '0',
      })) : [],
      topPages: Array.isArray(pagesData) ? pagesData.slice(0, 10).map((page: any) => ({
        url: page.label || '/',
        pageviews: page.nb_hits || 0,
        bounceRate: page.bounce_rate ? parseFloat(page.bounce_rate) : 0,
        avgTimeOnPage: page.avg_time_on_page || 0,
      })) : [],
      referrers: Array.isArray(referrersData) ? referrersData.slice(0, 10).map((ref: any) => ({
        label: ref.label || 'Direct',
        visits: ref.nb_visits || 0,
        percentage: ref.nb_visits && todayData.nb_visits
          ? ((ref.nb_visits / todayData.nb_visits) * 100).toFixed(1)
          : '0',
      })) : [],
      browsers: Array.isArray(browsersData) ? browsersData.slice(0, 5).map((browser: any) => ({
        label: browser.label || 'Unknown',
        visits: browser.nb_visits || 0,
        percentage: browser.nb_visits && todayData.nb_visits
          ? ((browser.nb_visits / todayData.nb_visits) * 100).toFixed(1)
          : '0',
      })) : [],
      operatingSystems: Array.isArray(osData) ? osData.slice(0, 5).map((os: any) => ({
        label: os.label || 'Unknown',
        visits: os.nb_visits || 0,
        percentage: os.nb_visits && todayData.nb_visits
          ? ((os.nb_visits / todayData.nb_visits) * 100).toFixed(1)
          : '0',
      })) : [],
      countries: Array.isArray(countriesData) ? countriesData.slice(0, 10).map((country: any) => ({
        label: country.label || 'Unknown',
        visits: country.nb_visits || 0,
        percentage: country.nb_visits && todayData.nb_visits
          ? ((country.nb_visits / todayData.nb_visits) * 100).toFixed(1)
          : '0',
      })) : [],
      entryPages: Array.isArray(entryPagesData) ? entryPagesData.slice(0, 10).map((page: any) => ({
        url: page.label || '/',
        visits: page.entry_nb_visits || 0,
        bounceRate: page.bounce_rate ? parseFloat(page.bounce_rate) : 0,
      })) : [],
      exitPages: Array.isArray(exitPagesData) ? exitPagesData.slice(0, 10).map((page: any) => ({
        url: page.label || '/',
        exits: page.exit_nb_visits || 0,
        exitRate: page.exit_rate ? parseFloat(page.exit_rate) : 0,
      })) : [],
      visitsByHour: (() => {
        if (Array.isArray(visitsByHourData)) {
          return visitsByHourData.map((hour: any, index: number) => ({
            hour: index,
            visits: hour.nb_visits || 0,
          }));
        } else if (typeof visitsByHourData === 'object' && visitsByHourData !== null) {
          return Object.entries(visitsByHourData).map(([hour, data]: [string, any]) => ({
            hour: parseInt(hour, 10),
            visits: data?.nb_visits || data || 0,
          }));
        }
        return [];
      })(),
      visitorTypes: {
        new: visitorTypesData.nb_visits || 0,
        returning: Math.max(0, (todayData.nb_visits || 0) - (visitorTypesData.nb_visits || 0)),
      },
    };

    return new Response(
      JSON.stringify(result),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching Matomo stats:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to fetch Matomo statistics",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});