import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import { useAuthStore } from "./store/useAuthStore";
import Success from "./pages/Success";

function UserRoute({ children }) {
  const { token, role } = useAuthStore();
  if (!token) return <Navigate to="/" />;
  return role === "user" ? children : <Navigate to="/admin" />;
}

function AdminRoute({ children }) {
  const { token, role } = useAuthStore();
  if (!token) return <Navigate to="/" />;
  return role === "admin" ? children : <Navigate to="/home" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<UserRoute><Home /></UserRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/success" element={<Success />} />
      </Routes>
    </BrowserRouter>
  );
}
