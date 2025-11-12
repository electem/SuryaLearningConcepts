import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import PrivateRoute from "./components/PrivateRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/cart" element={<Cart />} />
      <Route
        path="/checkout"
        element={
          <PrivateRoute>
            <Checkout />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
