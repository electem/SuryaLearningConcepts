import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY); // 👈 Your Stripe public key from .env

export default function Checkout() {
  const { cart, dispatch } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePayment = async () => {
  if (!name || !phone || !address) {
    alert("Please fill all details before payment.");
    return;
  }

  setLoading(true);
  try {
    // 1️⃣ Create checkout session on backend
    const res = await api.post("/payments/create-checkout-session", {
      items: cart.items,
      userInfo: { name, phone, address },
    });

    const { url } = res.data; // backend returns session.url now

    if (url) {
      // 2️⃣ Redirect user to Stripe checkout
      window.location.href = url;
    } else {
      alert("Something went wrong: Stripe session URL missing.");
    }
  } catch (err) {
    console.error("❌ Payment failed:", err);
    alert(err.response?.data?.error || "Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="max-w-lg mx-auto p-4">
      <h2 className="text-xl mb-4 font-semibold">Checkout</h2>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border p-2 mb-2 rounded"
        placeholder="Name"
      />
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full border p-2 mb-2 rounded"
        placeholder="Phone"
      />
      <textarea
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="w-full border p-2 mb-2 rounded"
        placeholder="Address"
      />

      <div className="mb-4 font-semibold">Total: ₹{total}</div>

      <button
        onClick={handlePayment}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full disabled:opacity-50"
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </div>
  );
}
