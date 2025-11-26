// src/store/useMovieStore.js
import { create } from "zustand";
import axios from "axios";
import { API_BASE } from "../api";
import { useAuthStore } from "./useAuthStore";

export const useMovieStore = create((set, get) => ({
  movies: [],
  loading: false,

  fetchMovies: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    set({ loading: true });

    try {
      const res = await axios.get(`${API_BASE}/movies/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      set({ movies: res.data.data || [], loading: false });
    } catch (err) {
      set({ loading: false });
      console.error("Movie fetch error:", err);
    }
  },

  adminSyncMovies: async () => {
    const token = useAuthStore.getState().token;

    await axios.post(
      `${API_BASE}/movies/sync`,
      { page: 1 },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  adminLoadMovies: async () => {
    const token = useAuthStore.getState().token;

    const res = await axios.get(`${API_BASE}/movies`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    set({ movies: res.data || [] });
  },

  adminSaveMovie: async (form, editingId) => {
    const token = useAuthStore.getState().token;

    if (editingId) {
      await axios.put(`${API_BASE}/movies/${editingId}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } else {
      await axios.post(`${API_BASE}/movies`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    await get().adminLoadMovies();
  },

  adminDeleteMovie: async (id) => {
    const token = useAuthStore.getState().token;

    await axios.delete(`${API_BASE}/movies/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    set({
      movies: get().movies.filter((m) => m._id !== id),
    });
  },
}));
