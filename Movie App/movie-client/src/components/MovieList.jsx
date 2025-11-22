import React, { useEffect, useState } from "react";
import axios from "axios";
import BookingForm from "./BookingForm";
import { API_BASE } from "../api";

export default function MovieList() {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("name"); // make sure you store user's name on login

  // Fetch movies
  const fetchMovies = async () => {
    try {
      const res = await axios.get(`${API_BASE}/movies/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMovies(res.data.data || []);
    } catch (err) {
      console.error("Error fetching movies:", err);
    }
  };

  useEffect(() => {
    if (token) fetchMovies();
  }, [page, token]);

  // Handle checkout (redirect to Stripe)
const handleCheckout = async (movie, tickets = 1) => {
  try {
    const userName = localStorage.getItem("name");
    if (!userName) return alert("User name missing");
    console.log("Selected movie for checkout:", movie);


    if (!movie.movie_id || !movie.original_title) {
      return alert("Movie data incomplete");
    }

    const amount = 10 * tickets; // USD per ticket

    // LOG what we are sending
    console.log("Checkout request payload:", {
      name: userName,
      movieId: movie.movie_id,
      movieTitle: movie.original_title,
      tickets,
      amount
    });

    const res = await axios.post(
      `${API_BASE}/bookings/create-checkout-session`,
      {
        name: userName,
        movieId: movie.movie_id,
        movieTitle: movie.original_title,
        tickets,
        amount
      }
    );

    console.log("Stripe session response:", res.data);

    window.location.href = res.data.url;
  } catch (err) {
    console.error("Checkout error:", err.response?.data || err);
    alert(err.response?.data?.error || "Checkout failed");
  }
};



  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-8 text-center">🎬 Movie Listings</h1>

      {/* Movie Grid */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {movies.map((m) => (
          <div
            key={m._id}
            className="bg-white shadow-lg rounded-xl overflow-hidden hover:scale-105 transition-transform"
          >
            <img
              src={m.poster_path}
              alt={m.title}
              className="w-full h-64 object-cover"
            />

            <div className="p-4">
              <h2 className="text-xl font-semibold mb-1">{m.title}</h2>
              <p className="text-gray-500 text-sm line-clamp-2">{m.overview}</p>

              <div className="flex items-center justify-between mt-4">
                <span className="text-yellow-500 font-semibold">
                  ⭐ {m.vote_average}
                </span>
                <span className="text-gray-600 text-sm">📅 {m.release_date}</span>
              </div>

              <button
                onClick={() => setSelectedMovie(m)}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-between mt-10">
        <button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          className="bg-gray-300 px-4 py-2 rounded disabled:bg-gray-200"
        >
          Previous
        </button>

        <span className="text-lg font-semibold">Page {page}</span>

        <button
          onClick={() => setPage(page + 1)}
          className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
        >
          Next
        </button>
      </div>

      {/* Booking Form Modal */}
      {selectedMovie && (
        <BookingForm
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onCheckout={(tickets) => handleCheckout(selectedMovie, tickets)}
        />
      )}
    </div>
  );
}
