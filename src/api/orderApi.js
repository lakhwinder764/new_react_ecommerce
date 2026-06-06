import { getAccessToken } from './authApi';
import { ORDERS_API } from './config';

async function orderRequest(path, options = {}) {
  const token = getAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${ORDERS_API}${path}`, {
    credentials: 'include',
    headers,
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      data.error ||
      data.detail ||
      Object.values(data).flat().join(' ') ||
      'Order request failed';
    throw new Error(message);
  }

  return data;
}

export const orderApi = {
  checkout: (payload) =>
    orderRequest('/checkout/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  list: () => orderRequest('/'),

  detail: (orderId) => orderRequest(`/${orderId}/`),
};
