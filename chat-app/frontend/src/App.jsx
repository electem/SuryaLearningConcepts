// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Chat from "./pages/Chat";
import { useAuth } from "./context/AuthContext";

function PrivateRoute({ children }) {
  const { state } = useAuth();
  return state.user ? children : <Navigate to="/" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
