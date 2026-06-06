import reducer from '../reducer/cartReducer';
import { createContext, useReducer, useContext, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './auth_context';
import { cartApi, mapApiCartToItems, setCartAuthTokenGetter } from '../api/cartApi';

const CartContext = createContext();

const initialState = {
  cart: [],
  total_item: 0,
  total_price: 0,
  shipping_fee: 5000,
  isCartLoading: true,
};

const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { isAuthenticated, isLoading, getAccessToken } = useAuth();
  const prevAuthenticatedRef = useRef(null);

  const syncFromApi = useCallback((apiCart) => {
    const cart = mapApiCartToItems(apiCart);
    dispatch({ type: 'SET_CART', payload: cart });
    dispatch({ type: 'CART_PRICE' });
  }, []);

  const loadCart = useCallback(async () => {
    dispatch({ type: 'SET_CART_LOADING', payload: true });
    try {
      const data = await cartApi.get();
      syncFromApi(data);
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      dispatch({ type: 'SET_CART_LOADING', payload: false });
    }
  }, [syncFromApi]);

  useEffect(() => {
    setCartAuthTokenGetter(() => getAccessToken());
  }, [getAccessToken]);

  useEffect(() => {
    if (isLoading) return;

    const handleAuthChange = async () => {
      dispatch({ type: 'SET_CART_LOADING', payload: true });
      try {
        if (isAuthenticated) {
          const data = await cartApi.sync();
          syncFromApi(data);
        } else {
          const data = await cartApi.get();
          syncFromApi(data);
        }
      } catch (error) {
        console.error('Failed to sync cart with auth state:', error);
      } finally {
        dispatch({ type: 'SET_CART_LOADING', payload: false });
      }
    };

    if (prevAuthenticatedRef.current === null) {
      prevAuthenticatedRef.current = isAuthenticated;
      if (isAuthenticated) {
        handleAuthChange();
      } else {
        loadCart();
      }
      return;
    }

    if (prevAuthenticatedRef.current !== isAuthenticated) {
      prevAuthenticatedRef.current = isAuthenticated;
      handleAuthChange();
    }
  }, [isAuthenticated, isLoading, loadCart, syncFromApi]);

  const addToCart = async (id, color, amount) => {
    try {
      const data = await cartApi.add(id, color, amount);
      syncFromApi(data);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const setIncrease = async (lineId, stock) => {
    const item = state.cart.find((cartItem) => cartItem.id === lineId);
    if (!item?.itemId) return;

    const newQty = Math.min(item.amount + 1, stock);
    try {
      const data = await cartApi.updateQuantity(item.itemId, newQty);
      syncFromApi(data);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const setDecrease = async (lineId) => {
    const item = state.cart.find((cartItem) => cartItem.id === lineId);
    if (!item?.itemId) return;

    const newQty = Math.max(item.amount - 1, 1);
    try {
      const data = await cartApi.updateQuantity(item.itemId, newQty);
      syncFromApi(data);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const removeCart = async (lineId) => {
    const item = state.cart.find((cartItem) => cartItem.id === lineId);
    if (!item?.itemId) return;

    try {
      const data = await cartApi.remove(item.itemId);
      syncFromApi(data);
    } catch (error) {
      console.error('Failed to remove from cart:', error);
    }
  };

  const clearCart = async () => {
    try {
      const data = await cartApi.clear();
      syncFromApi(data);
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        addToCart,
        removeCart,
        clearCart,
        setDecrease,
        setIncrease,
        loadCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

const useCartContext = () => {
  return useContext(CartContext);
};

export { CartProvider, useCartContext };
