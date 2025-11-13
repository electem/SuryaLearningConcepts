import { useEffect, useState } from "react";
import api from "../api/axios";

export default function OwnerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/orders/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err.response?.data || err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <p className="text-center p-8">Loading orders...</p>;
  if (orders.length === 0) return <p className="text-center p-8">No orders found</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">All Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="border p-4 rounded shadow">
            <div className="mb-2">
              <span className="font-semibold">Order ID:</span> {order._id}
            </div>
            <div className="mb-2">
              <span className="font-semibold">User:</span> {order.userInfo?.name || "N/A"} - {order.userInfo?.phone || "N/A"}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Address:</span> {order.userInfo?.address || "-"}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Items:</span>
              <ul className="list-disc ml-5">
                {order.items.map((item) => (
                  <li key={item.productId}>
                    {item.name} × {item.quantity} - ₹{item.price * item.quantity}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mb-2">
              <span className="font-semibold">Total:</span> ₹{order.total}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Status:</span> {order.status || "pending"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
