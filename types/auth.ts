export interface AuthPermission {
  write: number;
  read: number;
  name: string;
  iD: number;
}

export interface ApiAuthResponse {
  auths: AuthPermission[];
}

export interface ApiAuthError {
  hTTPError: string;
  returnCode: number;
  detailCode: number;
  message: string;
}

export interface NormalizedPermissions {
  isAdmin: boolean;
  authsByName: Record<string, {
    read: boolean;
    write: boolean;
    id: number;
  }>;
}

export interface UserSession {
  username: string;
  apiKey: string;
  permissions: NormalizedPermissions;
}
