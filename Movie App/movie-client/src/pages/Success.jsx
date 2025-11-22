import React, { useEffect, useState } from "react";
import { API_BASE } from "../api";
import { axiosAuth } from "../axiosConfig";

export default function Success() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get("session_id");
    const bookingData = JSON.parse(localStorage.getItem("recentBooking"));

    if (!sessionId || !bookingData) {
      setStatus("error");
      setMessage("Invalid request");
      setLoading(false);
      return;
    }

    const finalBooking = {
      ...bookingData,
      stripeSessionId: sessionId,
      paymentStatus: "Paid",
    };

    axiosAuth
      .post(`${API_BASE}/bookings/save-booking`, finalBooking)
      .then(() => {
        setStatus("success");
        setMessage("Your booking was completed successfully!");
        localStorage.removeItem("recentBooking");
      })
      .catch((err) => {
        console.error("Booking save failed", err);
        setStatus("error");
        setMessage("Payment succeeded but booking failed to save.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="bg-white shadow-xl rounded-2xl p-10 max-w-md w-full text-center animate-fadeIn">
        
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700">Processing your booking...</h2>
          </div>
        )}

        {/* Success State */}
        {!loading && status === "success" && (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-green-500 animate-scaleIn"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-green-600 mb-3">Booking Successful 🎉</h1>
            <p className="text-gray-700 mb-6">{message}</p>

            <a
              href="/"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-medium shadow hover:bg-green-700 transition"
            >
              Go Home
            </a>
          </>
        )}

        {/* Error State */}
        {!loading && status === "error" && (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-red-500 animate-scaleIn"
                  fill="none"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-red-600 mb-3">Booking Error</h1>
            <p className="text-gray-700 mb-6">{message}</p>

            <a
              href="/"
              className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg font-medium shadow hover:bg-red-700 transition"
            >
              Go Home
            </a>
          </>
        )}
      </div>
    </div>
  );
}
