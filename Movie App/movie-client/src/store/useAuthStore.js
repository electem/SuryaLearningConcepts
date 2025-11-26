// src/store/useAuthStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import { API_BASE } from "../api";

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      role: null,
      name: null,
      loading: false,

      login: async (email, password, role) => {
        set({ loading: true });

        try {
          const res = await axios.post(`${API_BASE}/auth/login`, {
            email,
            password,
            role,
          });

          const { token, role: serverRole, name } = res.data;

          set({
            token,
            role: serverRole,
            name,
            loading: false,
          });

          return { success: true, role: serverRole };
        } catch (err) {
          set({ loading: false });
          return { success: false, error: err.response?.data?.error };
        }
      },

      logout: () =>
        set({
          token: null,
          role: null,
          name: null,
        }),
    }),
    { name: "auth-storage" }
  )
);
