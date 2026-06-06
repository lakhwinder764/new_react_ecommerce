import { AUTH_API } from './config';
const STORAGE_KEY = 'ecom_auth';

async function authRequest(path, options = {}) {
  const res = await fetch(`${AUTH_API}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      data.detail ||
      data.error ||
      Object.values(data).flat().join(' ') ||
      'Request failed';
    throw new Error(message);
  }

  return data;
}

export function getStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveAuth({ access, refresh, user }) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ access, refresh, user })
  );
}

export function clearAuth() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getAccessToken() {
  return getStoredAuth()?.access ?? null;
}

export function getRefreshToken() {
  return getStoredAuth()?.refresh ?? null;
}

export const authApi = {
  register: (payload) =>
    authRequest('/register/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (email, password) =>
    authRequest('/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  refresh: (refresh) =>
    authRequest('/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh }),
    }),

  me: (accessToken) =>
    authRequest('/me/', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }),
};

export { STORAGE_KEY };
