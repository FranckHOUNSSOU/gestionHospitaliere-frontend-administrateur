// src/services/apiClient.ts
// Client HTTP centralisé — gère automatiquement le refresh du token
// et l'injection du header Authorization sur toutes les requêtes.

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
const ACCESS_TOKEN_KEY = 'hopital_access_token';
const REFRESH_TOKEN_KEY = 'hopital_refresh_token';

// ── Helpers tokens ─────────────────────────────────────────────────────────

function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

function saveTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// ── Refresh interne ────────────────────────────────────────────────────────

let refreshPromise: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${refreshToken}` },
    });

    if (!res.ok) {
      clearTokens();
      // Redirection vers login si la session est expirée
      window.location.href = '/login';
      return null;
    }

    const data: { accessToken: string; refreshToken: string } = await res.json();
    saveTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch {
    clearTokens();
    window.location.href = '/login';
    return null;
  }
}

// ── Fetch avec retry auto ──────────────────────────────────────────────────

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const token = getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Token expiré → refresh + retry une seule fois
  if (res.status === 401 && retry) {
    if (!refreshPromise) {
      refreshPromise = doRefresh().finally(() => { refreshPromise = null; });
    }
    const newToken = await refreshPromise;

    if (newToken) {
      return request<T>(endpoint, options, false);
    }
    throw new Error('Session expirée. Veuillez vous reconnecter.');
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg = Array.isArray(data.message)
      ? data.message.join(', ')
      : (data.message ?? `Erreur ${res.status}`);
    throw new Error(msg);
  }

  // 204 No Content — pas de body à parser
  if (res.status === 204) return {} as T;

  return res.json();
}

// ── API publique du client ─────────────────────────────────────────────────

const apiClient = {
  get<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint, { method: 'GET' });
  },

  post<T>(endpoint: string, body?: unknown): Promise<T> {
    return request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint, { method: 'DELETE' });
  },
};

export default apiClient;