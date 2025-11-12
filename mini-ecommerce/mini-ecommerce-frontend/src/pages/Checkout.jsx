import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Checkout() {
  const { cart, dispatch } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const navigate = useNavigate();

  const total = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);

  const placeOrder = async () => {
    try {
      await api.post("/orders", {
        items: cart.items,
        total,
        userInfo: { name, phone, address },
      });

      dispatch({ type: "CLEAR_CART" });

      // ✅ Show success message
      alert("✅ Payment successful! Your order has been placed.");

      // ✅ Redirect to /home
      navigate("/home");
    } catch (err) {
      console.error("❌ Order placement failed:", err);
      alert("Something went wrong while placing your order. Try again.");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <h2 className="text-xl mb-4">Checkout</h2>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border p-2 mb-2"
        placeholder="Name"
      />
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full border p-2 mb-2"
        placeholder="Phone"
      />
      <textarea
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="w-full border p-2 mb-2"
        placeholder="Address"
      />
      <div className="mb-4 font-semibold">Total: ₹{total}</div>

      <button
        onClick={placeOrder}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
      >
        Pay
      </button>
    </div>
  );
}
