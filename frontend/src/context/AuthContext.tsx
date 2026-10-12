import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, tokenStorage } from '../api/client';
import { DecodedToken, LoginPayload, ROLE_MAP, RoleDefinition } from '../types/api';

export interface CurrentUser {
  id: number;
  email: string;
  name: string;
  roleId: number;
  roleName: RoleDefinition;
  roleLabel: string;
  permissions: string[];
}

interface AuthContextType {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginPayload) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseJwtClaims(token: string): DecodedToken | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to parse JWT payload', e);
    return null;
  }
}

function buildUserFromToken(token: string): CurrentUser | null {
  const claims = parseJwtClaims(token);
  if (!claims || !claims.id) return null;

  const roleMeta = ROLE_MAP[claims.role_id] || {
    name: 'user' as RoleDefinition,
    label: `Role ${claims.role_id}`,
    permissions: ['read'],
  };

  return {
    id: parseInt(claims.id, 10),
    email: claims.email,
    name: claims.name || claims.email,
    roleId: claims.role_id,
    roleName: roleMeta.name,
    roleLabel: roleMeta.label,
    permissions: roleMeta.permissions,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const initAuth = useCallback(() => {
    const accessToken = tokenStorage.getAccessToken();
    if (accessToken) {
      const u = buildUserFromToken(accessToken);
      if (u) {
        setUser(u);
      } else {
        tokenStorage.clearTokens();
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    initAuth();

    const handleAuthExpired = () => {
      tokenStorage.clearTokens();
      setUser(null);
    };

    window.addEventListener('osseo:auth_expired', handleAuthExpired);
    return () => window.removeEventListener('osseo:auth_expired', handleAuthExpired);
  }, [initAuth]);

  const login = async (credentials: LoginPayload) => {
    const res = await api.login(credentials);
    tokenStorage.setTokens(res.access_token, res.refresh_token);
    const u = buildUserFromToken(res.access_token);
    setUser(u);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      console.warn('Backend logout encountered error or expired token', e);
    } finally {
      tokenStorage.clearTokens();
      setUser(null);
    }
  };

  /**
   * Evaluates UI affordances based on role permissions.
   * NOTE: As mandated, frontend checks are advisory only; the backend RBAC
   * is the true and final enforcement authority.
   */
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return user.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
