const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export function apiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export const PRODUCTS_API = apiUrl('/api/products/');
export const AUTH_API = apiUrl('/api/auth');
export const CART_API = apiUrl('/api/cart');
export const ORDERS_API = apiUrl('/api/orders');

export { API_BASE_URL };
