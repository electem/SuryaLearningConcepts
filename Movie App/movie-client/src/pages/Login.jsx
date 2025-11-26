import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");

  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);

  const navigate = useNavigate();

  const handleLogin = async () => {
    const result = await login(email, password, role);

    if (!result.success) return alert(result.error);

    if (result.role === "admin") navigate("/admin");
    else navigate("/home");
  };

  return (
    <div className="p-6 max-w-md mx-auto mt-10 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

      <input
        className="border p-2 w-full mb-3 rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />

      <input
        className="border p-2 w-full mb-3 rounded"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
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
        className="w-full bg-blue-600 text-white py-2 rounded"
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </div>
  );
}
