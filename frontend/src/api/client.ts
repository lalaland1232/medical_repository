import {
  AuthTokens,
  CreateCasePayload,
  LoginPayload,
  MedicalCase,
  MessageResponse,
  SignUpPayload,
  UpdateCasePayload,
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Token storage helpers
export const tokenStorage = {
  getAccessToken: () => localStorage.getItem('osseo_access_token'),
  getRefreshToken: () => localStorage.getItem('osseo_refresh_token'),
  setTokens: (access: string, refresh: string) => {
    localStorage.setItem('osseo_access_token', access);
    localStorage.setItem('osseo_refresh_token', refresh);
  },
  clearTokens: () => {
    localStorage.removeItem('osseo_access_token');
    localStorage.removeItem('osseo_refresh_token');
  },
};

let isRefreshing = false;
let refreshSubscribers: ((newToken: string) => void)[] = [];

function subscribeTokenRefresh(cb: (newToken: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(newToken: string) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  const token = tokenStorage.getAccessToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401 && !isRetry && endpoint !== '/login' && endpoint !== '/refresh_token') {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      tokenStorage.clearTokens();
      window.dispatchEvent(new CustomEvent('osseo:auth_expired'));
      throw new ApiError(401, 'Session expired. Please log in again.');
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh(async (newToken) => {
          try {
            headers.set('Authorization', `Bearer ${newToken}`);
            const retryRes = await fetch(url, { ...options, headers });
            if (!retryRes.ok) {
              const errData = await retryRes.json().catch(() => ({}));
              reject(new ApiError(retryRes.status, errData.detail || 'Request failed', errData));
              return;
            }
            resolve((await retryRes.json()) as T);
          } catch (err) {
            reject(err);
          }
        });
      });
    }

    isRefreshing = true;

    try {
      // Backend expects refresh token via Authorization: Bearer <token>
      const refreshRes = await fetch(`${API_BASE_URL}/refresh_token`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      if (!refreshRes.ok) {
        tokenStorage.clearTokens();
        window.dispatchEvent(new CustomEvent('osseo:auth_expired'));
        throw new ApiError(401, 'Refresh token revoked or expired. Please sign in again.');
      }

      const refreshedTokens: AuthTokens = await refreshRes.json();
      tokenStorage.setTokens(refreshedTokens.access_token, refreshedTokens.refresh_token);
      onRefreshed(refreshedTokens.access_token);
      isRefreshing = false;

      // Retry original request
      headers.set('Authorization', `Bearer ${refreshedTokens.access_token}`);
      const retryRes = await fetch(url, { ...options, headers });
      if (!retryRes.ok) {
        const errData = await retryRes.json().catch(() => ({}));
        throw new ApiError(retryRes.status, errData.detail || 'Request failed', errData);
      }
      return (await retryRes.json()) as T;
    } catch (err) {
      isRefreshing = false;
      tokenStorage.clearTokens();
      window.dispatchEvent(new CustomEvent('osseo:auth_expired'));
      throw err;
    }
  }

  if (!response.ok) {
    let errorDetail = response.statusText;
    let errorData = null;
    try {
      errorData = await response.json();
      if (typeof errorData?.detail === 'string') {
        errorDetail = errorData.detail;
      } else if (Array.isArray(errorData?.detail)) {
        // FastAPI / Pydantic validation error array
        errorDetail = errorData.detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ');
      }
    } catch {
      // Non-JSON error body
    }
    throw new ApiError(response.status, errorDetail || `Request failed with code ${response.status}`, errorData);
  }

  return response.json() as Promise<T>;
}

export const api = {
  // 1. Authentication
  async login(payload: LoginPayload): Promise<AuthTokens> {
    return request<AuthTokens>('/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // 2. Public Sign Up
  async signUp(payload: SignUpPayload): Promise<MessageResponse> {
    return request<MessageResponse>('/sign_up', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // 3. Admin Sign Up (Superuser only)
  async adminSignUp(payload: SignUpPayload): Promise<MessageResponse> {
    return request<MessageResponse>('/admin_sign_up', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // 4. Token Refresh
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    return request<AuthTokens>('/refresh_token', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });
  },

  // 5. Logout
  async logout(): Promise<MessageResponse> {
    return request<MessageResponse>('/logout', {
      method: 'POST',
    });
  },

  // 5. Get Cases List (Server-side pagination and filters)
  async getCases(params: {
    page: number;
    filter?: string;
    status?: string;
    surgeon_name?: string;
    patient_refrence?: string;
  }): Promise<MedicalCase[]> {
    const searchParams = new URLSearchParams();
    searchParams.set('page', params.page.toString());

    if (params.filter) {
      searchParams.set('filter', params.filter);
    }
    if (params.status) {
      searchParams.set('status', params.status);
    }
    if (params.surgeon_name) {
      searchParams.set('surgeon_name', params.surgeon_name);
    }
    if (params.patient_refrence) {
      searchParams.set('patient_refrence', params.patient_refrence);
    }

    return request<MedicalCase[]>(`/cases?${searchParams.toString()}`, {
      method: 'GET',
    });
  },

  // 6. Get Case by ID
  async getCaseById(caseId: string): Promise<MedicalCase> {
    return request<MedicalCase>(`/cases/${encodeURIComponent(caseId)}`, {
      method: 'GET',
    });
  },

  // 7. Create Case
  async createCase(payload: CreateCasePayload): Promise<MessageResponse> {
    return request<MessageResponse>('/create_case', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // 8. Update Case Status (Dedicated PATCH endpoint)
  async updateCaseStatus(caseId: string, payload: UpdateCasePayload): Promise<MessageResponse> {
    return request<MessageResponse>(`/cases/${encodeURIComponent(caseId)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  // 9. Delete Case
  async deleteCase(caseId: string): Promise<MessageResponse> {
    return request<MessageResponse>(`/cases/${encodeURIComponent(caseId)}`, {
      method: 'DELETE',
    });
  },
};
