import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Success from "./pages/Success";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-blue-600 text-white p-4 text-center text-xl font-bold">
          🎟 Movie Ticket Booking
        </header>

        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/success" element={<Success />} />
        </Routes>
      </div>
    </Router>
  );
}
