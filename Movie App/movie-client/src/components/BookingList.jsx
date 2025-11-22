import React, { useEffect, useState } from "react";
import { axiosAuth } from "../axiosConfig";
import { API_BASE } from "../api";

export default function BookingList() {
  const [data, setData] = useState([]);

  const load = async () => {
    try {
      const res = await axiosAuth.get(`${API_BASE}/bookings`);
      setData(res.data);
    } catch (err) {
      console.error(err);
      alert("Unauthorized! Login again.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-6 mt-8">
      <h1 className="text-2xl font-bold mb-4">All Bookings</h1>

      {data.map((b) => (
        <div key={b._id} className="border p-4 rounded mb-2 flex justify-between">
          <div>
            <p><b>Name:</b> {b.name}</p>
            <p><b>Movie:</b> {b.movieTitle}</p>
            <p><b>Tickets:</b> {b.tickets}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
