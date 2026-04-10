import axios from "axios";

const API = "http://localhost:5000/api/auth";

export const sendOTP = (phone) =>
  axios.post(`${API}/send-otp`, { phone });

export const verifyOTP = (phone, otp) =>
  axios.post(`${API}/verify-otp`, { phone, otp });