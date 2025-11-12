import React, { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Cart() {
  const { cart, dispatch } = useCart();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

 useEffect(() => {
  const loadCart = async () => {
    try {
      const userId = localStorage.getItem("userId") || "guest";
      const token = localStorage.getItem("token");

      const res = await api.get(`/cart?userId=${userId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.data?.items) {
        dispatch({ type: "SET_CART", payload: res.data.items });
      }
    } catch (err) {
      console.error("Error loading cart:", err);
    } finally {
      setLoading(false);
    }
  };
  loadCart();
}, [dispatch]);


 const handleRemove = async (productId) => {
  try {
    const userId = localStorage.getItem("userId") || "guest";
    await api.delete(`/cart/remove/${userId}/${productId}`);
    dispatch({ type: "REMOVE_ITEM", payload: productId });
  } catch (err) {
    console.error("Failed to remove item:", err);
  }
};


  const total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (loading)
    return <div className="p-4 text-center">Loading your cart...</div>;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl mb-4 font-semibold">Your Cart</h2>

      {cart.items.length === 0 ? (
        <div>Your cart is empty</div>
      ) : (
        <>
          {cart.items.map((i) => (
            <div
              key={i.productId}
              className="flex justify-between items-center border p-2 mb-2 rounded"
            >
              <div>
                <div className="font-semibold">{i.name}</div>
                <div>Qty: {i.quantity}</div>
              </div>
              <div>
                <div>₹{i.price}</div>
                <button
                  onClick={() => handleRemove(i.productId)}
                  className="text-red-600 ml-2"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div className="mt-4 flex justify-between items-center border-t pt-4">
            <div className="font-semibold">Total: ₹{total.toFixed(2)}</div>
            <button
              onClick={() => navigate("/checkout")}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
