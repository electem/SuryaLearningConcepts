import React, { useState } from "react";
import axios from "axios";
import { API_BASE } from "../api";

export default function BookingForm({ movie, onClose }) {
  const [name, setName] = useState("");
  const [tickets, setTickets] = useState(1);
  const [loading, setLoading] = useState(false);

  const TICKET_PRICE = 100;
  const amount = tickets * TICKET_PRICE;

  const handlePay = async () => {
    if (!name.trim()) return alert("Enter customer name");

    setLoading(true);

    try {
      const bookingPayload = {
        name,
        movieId: movie.movie_id,
        movieTitle: movie.original_title,
        tickets,
        amount,
      };

      // Save temp booking so we can read after Stripe redirects
      localStorage.setItem("recentBooking", JSON.stringify(bookingPayload));

      const res = await axios.post(
        `${API_BASE}/bookings/create-checkout-session`,
        bookingPayload
      );

      // Stripe checkout redirect
      window.location = res.data.url;
    } catch (error) {
      console.error(error);
      alert("Payment failed");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <div className="bg-white p-6 rounded w-96 shadow-lg">
        <h2 className="text-2xl font-bold mb-2">{movie.original_title}</h2>

        <p className="mb-3 text-gray-700">
          Amount: <span className="font-bold">${amount}</span>
        </p>

        <input
          className="border p-2 w-full mb-3 rounded"
          placeholder="Customer Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="number"
          min="1"
          className="border p-2 w-full mb-3 rounded"
          value={tickets}
          onChange={(e) => setTickets(Number(e.target.value))}
        />

        <div className="flex justify-between mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
            Cancel
          </button>

          <button
            onClick={handlePay}
            disabled={!name || loading}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            {loading ? "Processing..." : "Pay & Book"}
          </button>
        </div>
      </div>
    </div>
  );
}
