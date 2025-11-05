import { useState } from "react";
import api from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ usernameOrEmail: "", password: "" });
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/auth/login", form);

      // Store globally
      login(res.data.token, {
        username: res.data.user?.username || "",
        email: form.usernameOrEmail,
      });

      navigate("/dashboard");
    } catch (err: any) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

        <input
          type="text"
          placeholder="Email"
          autoComplete="off"
          className="w-full border p-2 mb-3"
          onChange={(e) =>
            setForm({ ...form, usernameOrEmail: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          autoComplete="new-password"
          className="w-full border p-2 mb-3"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button
          type="submit"
          className="bg-blue-600 text-white w-full p-2 rounded"
        >
          Login
        </button>

        <p
          className="text-sm mt-3 text-center text-blue-600 cursor-pointer"
          onClick={() => navigate("/")}
        >
          Don’t have an account? Sign up
        </p>
      </form>
    </div>
  );
}
