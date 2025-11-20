import React, { useEffect, useState } from "react";
import axios from "axios";
import BookingForm from "./BookingForm";
import { API_BASE } from "../api";

export default function MovieList() {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const fetchMovies = async () => {
    try {
      const res = await axios.get(`${API_BASE}/movies?page=${page}`);
      setMovies(res.data.data);
      
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [page]);
  
      console.log("movies data",movies);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-8 text-center">🎬 Movie Listings</h1>

      {/* Movie Grid */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {movies.map((m) => (
          <div
            key={m.id}
            className="bg-white shadow-lg rounded-xl overflow-hidden hover:scale-105 transition-transform"
          >
            <img
              src={m.poster_path}
              alt={m.original_title}
              className="w-full h-64 object-cover"
            />

            <div className="p-4">
              <h2 className="text-xl font-semibold mb-1">{m.original_title}</h2>

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
        <BookingForm movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}
    </div>
  );
}
