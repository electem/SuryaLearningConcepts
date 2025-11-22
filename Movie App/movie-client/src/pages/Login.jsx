import React, { useState } from "react";
import axios from "axios";
import { API_BASE } from "../api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      alert("Enter email and password");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, { email, password, role });
      const { token, role: serverRole } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", serverRole);

      setEmail("");
      setPassword("");

      if (serverRole === "admin") navigate("/admin");
      else navigate("/home");
    } catch (err) {
      alert(err.response?.data?.error || "Invalid login credentials");
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-md mx-auto mt-10 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

      <input
        className="border p-2 w-full mb-3 rounded"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="off"
      />

      <input
        type="password"
        className="border p-2 w-full mb-4 rounded"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="off"
      />

      <select
        className="border p-2 w-full mb-4 rounded"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>

      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded"
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </div>
  );
}
