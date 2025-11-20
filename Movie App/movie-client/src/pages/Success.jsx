import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../api";

export default function Success() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get("session_id");
    const bookingData = JSON.parse(localStorage.getItem("recentBooking"));

    if (!sessionId || !bookingData) {
      setMessage("Invalid request");
      setLoading(false);
      return;
    }

    // Data to send
    const finalBooking = {
      ...bookingData,
      stripeSessionId: sessionId,
      paymentStatus: "Paid",
    };

    axios
      .post(`${API_BASE}/bookings/save-booking`, finalBooking)
      .then(() => {
        setMessage("🎉 Booking successful!");
        localStorage.removeItem("recentBooking");
      })
      .catch((err) => {
        console.error("Booking save failed", err);
        setMessage("Payment succeeded but booking failed to save!");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <h2>Processing your booking...</h2>;

  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">{message}</h1>
      <a href="/" className="text-blue-600 underline">
        Go Home
      </a>
    </div>
  );
}
