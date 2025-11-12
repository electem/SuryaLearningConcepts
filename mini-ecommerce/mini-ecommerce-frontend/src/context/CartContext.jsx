import { createContext, useContext, useReducer, useEffect } from "react";
import api from "../api/axios";

const CartContext = createContext();

const initialState = { items: [] };

function cartReducer(state, action) {
  switch (action.type) {
    case "SET_CART":
      return { ...state, items: action.payload };

    case "ADD_ITEM": {
      const existing = state.items.find(
        (i) => i.productId === action.payload.productId
      );
      let updatedItems;
      if (existing) {
        updatedItems = state.items.map((i) =>
          i.productId === action.payload.productId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        updatedItems = [...state.items, action.payload];
      }
      return { ...state, items: updatedItems };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((i) => i.productId !== action.payload),
      };

    case "CLEAR_CART":
      return initialState;

    default:
      return state;
  }
}

export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, initialState);

  // 🧠 Load user's cart from backend once on app start
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await api.get("/cart");
        if (res.data?.items) {
          dispatch({ type: "SET_CART", payload: res.data.items });
        }
      } catch (err) {
        console.error("Failed to fetch cart:", err);
      }
    };
    fetchCart();
  }, []);

  return (
    <CartContext.Provider value={{ cart, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
