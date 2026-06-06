import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AppProvider } from './context/productContext';
import { FilterContextProvider } from './context/filter_context';
import { AuthProvider } from './context/auth_context';
import { CartProvider } from './context/cart_context';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AppProvider>
    <FilterContextProvider>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </FilterContextProvider>
  </AppProvider>
);
