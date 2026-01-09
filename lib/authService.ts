import { ApiAuthResponse, ApiAuthError, NormalizedPermissions, UserSession, AuthPermission } from '@/types/auth';

export class AuthService {
  static async authenticate(username: string, apiKey: string): Promise<UserSession> {
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/auth-proxy?apikey=${encodeURIComponent(apiKey)}`;

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData: ApiAuthError = await response.json();
        throw new Error(errorData.message || 'Login fehlgeschlagen');
      }

      const data = await response.json();

      const permissions = this.normalizePermissions(data);

      return {
        username,
        apiKey,
        permissions
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Ungültige Zugangsdaten');
    }
  }

  static normalizePermissions(apiResponse: any): NormalizedPermissions {
    if (Array.isArray(apiResponse) && apiResponse.length === 0) {
      return {
        isAdmin: true,
        authsByName: {}
      };
    }

    if (apiResponse.auths && Array.isArray(apiResponse.auths)) {
      const authsByName: Record<string, { read: boolean; write: boolean; id: number }> = {};

      apiResponse.auths.forEach((auth: AuthPermission) => {
        const existingAuth = authsByName[auth.name];

        if (existingAuth) {
          authsByName[auth.name] = {
            read: existingAuth.read || auth.read === 1,
            write: existingAuth.write || auth.write === 1,
            id: auth.iD
          };
        } else {
          authsByName[auth.name] = {
            read: auth.read === 1,
            write: auth.write === 1,
            id: auth.iD
          };
        }
      });

      return {
        isAdmin: false,
        authsByName
      };
    }

    return {
      isAdmin: false,
      authsByName: {}
    };
  }

  static saveSession(session: UserSession): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_session', JSON.stringify(session));
    }
  }

  static loadSession(): UserSession | null {
    if (typeof window === 'undefined') return null;

    try {
      const sessionData = localStorage.getItem('auth_session');
      if (!sessionData) return null;

      return JSON.parse(sessionData) as UserSession;
    } catch {
      return null;
    }
  }

  static clearSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_session');
    }
  }

  static hasPermission(permissions: NormalizedPermissions, permissionName: string, requireWrite: boolean = false): boolean {
    if (permissions.isAdmin) return true;

    const auth = permissions.authsByName[permissionName];
    if (!auth) return false;

    return requireWrite ? auth.write : auth.read;
  }
}
