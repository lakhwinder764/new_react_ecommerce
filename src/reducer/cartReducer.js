const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':
      return { ...state, cart: action.payload };

    case 'SET_CART_LOADING':
      return { ...state, isCartLoading: action.payload };

    case 'CART_PRICE': {
      const { total_item, total_price } = state.cart.reduce(
        (acc, item) => {
          acc.total_item += item.amount;
          acc.total_price += item.amount * item.price;
          return acc;
        },
        { total_item: 0, total_price: 0 }
      );
      return { ...state, total_item, total_price };
    }

    case 'CLEAR_CART':
      return { ...state, cart: [], total_item: 0, total_price: 0 };

    default:
      return state;
  }
};

export default cartReducer;
