// src/store/useBookingStore.js
import { create } from "zustand";
import axios from "axios";
import { API_BASE } from "../api";
import { useAuthStore } from "./useAuthStore";

export const useBookingStore = create((set) => ({
  selectedMovie: null,
  loading: false,

  selectMovie: (movie) => set({ selectedMovie: movie }),
  clearSelectedMovie: () => set({ selectedMovie: null }),

  checkout: async (movie, tickets) => {
    const name = useAuthStore.getState().name;
    if (!name) return alert("User name missing");

    const amount = tickets * 10;

    const payload = {
      name,
      movieId: movie.movie_id,
      movieTitle: movie.original_title,
      tickets,
      amount,
    };

    const res = await axios.post(
      `${API_BASE}/bookings/create-checkout-session`,
      payload
    );

    window.location.href = res.data.url;
  },
}));
