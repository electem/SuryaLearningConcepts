import axios from "axios";
import { useAuthStore } from "./store/useAuthStore";

export const axiosAuth = axios.create();

axiosAuth.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token; // ✅ get token from Zustand
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
