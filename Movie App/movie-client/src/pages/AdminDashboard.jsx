import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../api";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [movies, setMovies] = useState([]);
  const [form, setForm] = useState({
    title: "",
    overview: "",
    poster_path: "",
    release_date: "",
    vote_average: 0
  });
  const [editingId, setEditingId] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Redirect if not admin
  useEffect(() => {
    if (!token || role !== "admin") {
      navigate("/");
    }
  }, [token, role, navigate]);

  // Auto-sync & load movies
  useEffect(() => {
    if (!token) return;

    const syncAndLoad = async () => {
      try {
        // Sync with external API
        await axios.post(`${API_BASE}/movies/sync`, { page: 1 }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Load movies from DB
        const res = await axios.get(`${API_BASE}/movies`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMovies(res.data || []);
      } catch (err) {
        console.error(err);
        alert("Failed to sync or load movies");
      }
    };

    syncAndLoad();

    // Optional: periodic sync every 5 minutes
    const interval = setInterval(syncAndLoad, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [token]);

  // Add or update movie
  const saveMovie = async () => {
    if (!form.title.trim()) return alert("Enter title");

    try {
      if (editingId) {
        await axios.put(`${API_BASE}/movies/${editingId}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_BASE}/movies`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setForm({ title: "", overview: "", poster_path: "", release_date: "", vote_average: 0 });
      setEditingId(null);

      // Reload movies
      const res = await axios.get(`${API_BASE}/movies`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMovies(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to save movie");
    }
  };

  // Delete movie
  const deleteMovie = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`${API_BASE}/movies/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMovies(movies.filter((m) => m._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete movie");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Dashboard</h1>

      {/* Movie Form */}
      <div className="mb-6 space-y-2">
        <input
          className="border p-2 w-full rounded"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <input
          className="border p-2 w-full rounded"
          placeholder="Overview"
          value={form.overview}
          onChange={(e) => setForm({ ...form, overview: e.target.value })}
        />
        <input
          className="border p-2 w-full rounded"
          placeholder="Poster URL"
          value={form.poster_path}
          onChange={(e) => setForm({ ...form, poster_path: e.target.value })}
        />
        <input
          className="border p-2 w-full rounded"
          placeholder="Release Date"
          value={form.release_date}
          onChange={(e) => setForm({ ...form, release_date: e.target.value })}
        />
        <input
          type="number"
          className="border p-2 w-full rounded"
          placeholder="Vote Average"
          value={form.vote_average}
          onChange={(e) => setForm({ ...form, vote_average: e.target.value })}
        />

        <button
          onClick={saveMovie}
          className="w-full bg-green-600 text-white py-2 rounded"
        >
          {editingId ? "Update Movie" : "Add Movie"}
        </button>
      </div>

      {/* Movie Grid */}
      <h2 className="text-2xl font-bold mb-6">Movies</h2>
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
              <div className="flex gap-3 mt-3">
                <button
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                  onClick={() => {
                    setEditingId(m._id);
                    setForm({
                      title: m.title,
                      overview: m.overview,
                      poster_path: m.poster_path,
                      release_date: m.release_date,
                      vote_average: m.vote_average
                    });
                  }}
                >
                  Edit
                </button>
                <button
                  className="px-3 py-1 bg-red-600 text-white rounded"
                  onClick={() => deleteMovie(m._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
