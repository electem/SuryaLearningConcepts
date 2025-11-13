import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { dispatch } = useCart();
  const navigate = useNavigate();

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products", {
          params: { search, sort, page, limit: 9 },
        });
        setProducts(res.data.products);
        setTotalPages(res.data.pages);
      } catch (err) {
        console.error(err);
        setProducts([]);
      }
    };
    fetchProducts();
  }, [search, sort, page]);

  const handleAddToCart = async (p) => {
    try {
      const userId = localStorage.getItem("userId") || "guest";
      const token = localStorage.getItem("token");

      // Update frontend cart
      dispatch({
        type: "ADD_ITEM",
        payload: {
          productId: p._id,
          name: p.name,
          price: p.price,
          quantity: 1,
        },
      });

      // Save to backend
      await api.post(
        "/cart/add",
        {
          userId,
          productId: p._id,
          name: p.name,
          price: p.price,
          quantity: 1,
        },
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );

      navigate("/cart");
    } catch (err) {
      console.error(err.response?.data || err);
      alert("Failed to add to cart. Please try again.");
    }
  };

  if (products.length === 0)
    return <p className="text-center text-gray-500 p-8">Loading products...</p>;

  return (
    <div className="p-4">
      {/* Cart Button */}
      <div className="flex justify-end mb-2">
        <button
          onClick={() => navigate("/cart")}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          🛒 Cart
        </button>
      </div>

      {/* Search & Sort */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1); // reset page when search changes
          }}
          className="border p-2 flex-1 rounded"
        />
        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1); // reset page when sort changes
          }}
          className="border p-2 rounded"
        >
          <option value="">Sort By</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
          <option value="name_asc">Name: A → Z</option>
          <option value="name_desc">Name: Z → A</option>
        </select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {products.map((p) => (
          <div
            key={p._id}
            className="border rounded-lg p-4 shadow hover:shadow-md transition"
          >
            <img
              src={p.image}
              alt={p.name}
              className="h-40 w-full object-cover mb-2 rounded"
            />
            <h3 className="font-semibold text-lg mb-1">{p.name}</h3>
            <p className="text-gray-600 text-sm line-clamp-2 mb-2">
              {p.description}
            </p>
            <p className="text-blue-700 font-bold mb-2">₹{p.price}</p>
            <button
              onClick={() => handleAddToCart(p)}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded text-sm"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-4 mt-4">
        <button
          disabled={page <= 1}
          onClick={() => setPage((prev) => prev - 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="px-4 py-2">
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((prev) => prev + 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
