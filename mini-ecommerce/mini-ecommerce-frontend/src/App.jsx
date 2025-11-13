import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import PrivateRoute from "./components/PrivateRoute";
import Success from "./pages/Success";
import OwnerDashboard from "./pages/OwnerDashboard";
import OwnerOrders from "./pages/OwnerOrders";

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
      <Route
        path="/owner"
        element={
          <PrivateRoute roles={["owner"]}>
            <OwnerDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/owner/orders"
        element={
          <PrivateRoute role="owner">
            <OwnerOrders />
          </PrivateRoute>
        }
      />
      <Route path="/success" element={<Success />} />
    </Routes>
  );
}
