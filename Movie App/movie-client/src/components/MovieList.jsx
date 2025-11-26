import React, { useEffect, useState } from "react";
import BookingForm from "./BookingForm";
import { axiosAuth } from "../axiosConfig";
import { API_BASE } from "../api";
import { useAuthStore } from "../store/useAuthStore";

export default function MovieList() {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [selectedMovie, setSelectedMovie] = useState(null);

  const userName = useAuthStore((s) => s.name);
  const token = useAuthStore((s) => s.token);

  const fetchMovies = async () => {
    try {
      if (!token) return;

      const res = await axiosAuth.get(`${API_BASE}/movies/all`, {
        params: {
          search,
          sortBy,
          order,
          page,
          limit: 20,
        },
      });

      setMovies(res.data.data || []);
    } catch (err) {
      console.error("Error fetching movies:", err.response?.data || err);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [token, page, search, sortBy, order]);

  const handleCheckout = async (movie, tickets = 1) => {
    try {
      if (!userName) return alert("User name missing");

      if (!movie.movie_id || !movie.original_title) {
        return alert("Movie data incomplete");
      }

      const payload = {
        name: userName,
        movieId: movie.movie_id,
        movieTitle: movie.original_title,
        tickets,
        amount: 10 * tickets,
      };

      const res = await axiosAuth.post(
        `${API_BASE}/bookings/create-checkout-session`,
        payload
      );

      window.location.href = res.data.url;
    } catch (err) {
      console.error("Checkout error:", err.response?.data || err);
      alert(err.response?.data?.error || "Checkout failed");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">

      <h1 className="text-2xl font-bold mb-8 text-center">🎬 Movie Listings</h1>

      {/* SEARCH + SORT */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search movies..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="border p-2 rounded w-full"
        />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="createdAt">Newest</option>
          <option value="title">Title</option>
          <option value="vote_average">Rating</option>
          <option value="release_date">Release Date</option>
        </select>

        <select
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="desc">⬇ Desc</option>
          <option value="asc">⬆ Asc</option>
        </select>
      </div>

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
                <span className="text-gray-600 text-sm">
                  📅 {m.release_date}
                </span>
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
