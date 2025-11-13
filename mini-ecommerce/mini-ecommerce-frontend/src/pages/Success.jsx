import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../api/axios";

export default function Success() {
  const [searchParams] = useSearchParams();
  const [session, setSession] = useState(null);
  const { dispatch } = useCart();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!sessionId) return;

    const fetchSession = async () => {
      try {
        const { data } = await api.get(`/payments/session-status?session_id=${sessionId}`);
        setSession(data);

        // ✅ Clear cart after successful payment
        const userId = localStorage.getItem("userId") || "guest";
        await api.delete(`/cart/clear/${userId}`);
        dispatch({ type: "SET_CART", payload: [] }); // update frontend state
        console.log("🧺 Cart cleared after payment success");
      } catch (err) {
        console.error("Error fetching session or clearing cart:", err);
      }
    };

    fetchSession();
  }, [sessionId, dispatch]);

  if (!session) 
    return <h2 style={{ textAlign: "center", marginTop: "3rem" }}>Loading payment details...</h2>;

  return (
    <div style={{ textAlign: "center", marginTop: "5rem" }}>
      <h1>✅ Payment Successful!</h1>
      <p>Session ID: {session.id}</p>
      <p>Amount Paid: {session.amount_total / 100} {session.currency.toUpperCase()}</p>
      <p>Customer: {session.customer_name}</p>
      <p>Email: {session.customer_email}</p>
      <p>Status: {session.payment_status}</p>
    </div>
  );
}
