export interface ApiClientConfig {
  apiKey: string;
  siteId?: number | null;
  signal?: AbortSignal;
}

export class ApiClient {
  private static activeRequests = new Map<string, AbortController>();

  static async request<T>(
    endpoint: string,
    config: ApiClientConfig,
    options?: {
      method?: string;
      body?: any;
      skipSiteId?: boolean;
      requestId?: string;
    }
  ): Promise<T> {
    const { apiKey, siteId, signal } = config;
    const { method = 'GET', body, skipSiteId = false, requestId } = options || {};

    if (!skipSiteId && (siteId === null || siteId === undefined)) {
      throw new Error('Bitte wählen Sie einen Standort aus');
    }

    if (requestId) {
      const existingController = this.activeRequests.get(requestId);
      if (existingController) {
        existingController.abort();
      }

      const newController = new AbortController();
      this.activeRequests.set(requestId, newController);

      if (signal) {
        signal.addEventListener('abort', () => {
          newController.abort();
          this.activeRequests.delete(requestId);
        });
      }
    }

    const params = new URLSearchParams({
      endpoint,
      apikey: apiKey,
    });

    if (!skipSiteId && siteId !== null && siteId !== undefined) {
      params.append('siteid', siteId.toString());
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/api-proxy?${params.toString()}`;

    try {
      const response = await fetch(apiUrl, {
        method,
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: requestId ? this.activeRequests.get(requestId)?.signal : signal,
      });

      if (requestId) {
        this.activeRequests.delete(requestId);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'API-Fehler');
      }

      return await response.json();
    } catch (error) {
      if (requestId) {
        this.activeRequests.delete(requestId);
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request abgebrochen');
      }

      throw error;
    }
  }

  static abortRequest(requestId: string) {
    const controller = this.activeRequests.get(requestId);
    if (controller) {
      controller.abort();
      this.activeRequests.delete(requestId);
    }
  }

  static abortAllRequests() {
    this.activeRequests.forEach(controller => controller.abort());
    this.activeRequests.clear();
  }
}
