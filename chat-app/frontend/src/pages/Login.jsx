// frontend/src/pages/Login.jsx
import { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { dispatch } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", { username, password });
      dispatch({ type: "LOGIN", payload: res.data });
      localStorage.setItem("token", res.data.token);
      navigate("/chat");
    } catch (err) {
      alert(err.response.data.msg);
    }
  };

 return (
  <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
    <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8 border border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
        Welcome Back
      </h2>

      <div className="flex flex-col space-y-4">
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="off"
          className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          onClick={handleLogin}
          className="bg-blue-600 hover:bg-blue-700 transition text-white py-3 rounded-lg font-medium shadow-md"
        >
          Login
        </button>
      </div>

      <p className="text-center text-gray-500 text-sm mt-6">
        Secure Login • Chat Application
      </p>
    </div>
  </div>
);


}
