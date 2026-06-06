import { CART_API } from './config';

let getAuthToken = null;

export function setCartAuthTokenGetter(fn) {
  getAuthToken = fn;
}

async function cartRequest(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (getAuthToken) {
    try {
      const token = await getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Failed to get auth token for cart:', error);
    }
  }

  const res = await fetch(`${CART_API}${path}`, {
    credentials: 'include',
    headers,
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Cart request failed');
  }

  return res.json();
}

export function mapApiCartToItems(apiCart) {
  if (!apiCart?.items?.length) {
    return [];
  }

  return apiCart.items.map((item) => {
    const image =
      typeof item.product.image === 'string'
        ? item.product.image
        : item.product.image?.[0]?.url ?? '';

    return {
      id: `${item.product.id}${item.color}`,
      itemId: item.id,
      productId: item.product.id,
      name: item.product.name,
      color: item.color,
      amount: item.quantity,
      image,
      price: item.product.price,
      max: item.product.stock,
    };
  });
}

export const cartApi = {
  get: () => cartRequest('/'),
  sync: () =>
    cartRequest('/sync/', {
      method: 'POST',
      body: JSON.stringify({}),
    }),
  add: (productId, color, quantity) =>
    cartRequest('/add/', {
      method: 'POST',
      body: JSON.stringify({
        product_id: productId,
        color: color || '',
        quantity,
      }),
    }),
  updateQuantity: (itemId, quantity) =>
    cartRequest('/update/', {
      method: 'POST',
      body: JSON.stringify({ item_id: itemId, quantity }),
    }),
  remove: (itemId) =>
    cartRequest('/remove/', {
      method: 'POST',
      body: JSON.stringify({ item_id: itemId }),
    }),
  clear: () =>
    cartRequest('/clear/', {
      method: 'POST',
      body: JSON.stringify({}),
    }),
};
