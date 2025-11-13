import { useEffect, useState } from "react";
import api from "../api/axios";

export default function OwnerDashboard() {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    imageFile: null,
  });
  const [existingImage, setExistingImage] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Helper to get correct image URL
  const getImageUrl = (image) => {
    if (!image) return null;
    return image.startsWith("http") ? image : `http://localhost:5000${image}`;
  };

  // Fetch products with search, sort, pagination
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

  useEffect(() => {
    fetchProducts();
  }, [search, sort, page]);

  // Add or update product
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const data = new FormData();

    data.append("name", formData.name);
    data.append("price", formData.price);
    data.append("category", formData.category);
    data.append("description", formData.description);

    if (formData.imageFile instanceof File) {
      data.append("image", formData.imageFile);
    }

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, data, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
      } else {
        if (!(formData.imageFile instanceof File)) {
          alert("Please upload an image for the product");
          return;
        }
        await api.post("/products", data, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
      }

      setFormData({ name: "", price: "", category: "", description: "", imageFile: null });
      setExistingImage(null);
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Failed to save product");
    }
  };

  // Edit product
  const handleEdit = (product) => {
    setEditingId(product._id);
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description,
      imageFile: null,
    });
    setExistingImage(product.image || null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete product
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    const token = localStorage.getItem("token");
    try {
      await api.delete(`/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Failed to delete product");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Owner Dashboard</h1>

      {/* Search & Sort */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="border p-2 flex-1 rounded"
        />
        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
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

      {/* Product Form */}
      <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-2">
        {(formData.imageFile || existingImage) && (
          <img
            src={formData.imageFile ? URL.createObjectURL(formData.imageFile) : getImageUrl(existingImage)}
            alt="Preview"
            className="h-32 w-full object-cover mb-2"
          />
        )}
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="border p-2 rounded"
          required
        />
        <input
          type="number"
          placeholder="Price"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="border p-2 rounded"
          required
        />
        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="border p-2 rounded"
          required
        />
        <input
          type="file"
          onChange={(e) => setFormData({ ...formData, imageFile: e.target.files[0] })}
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          {editingId ? "Update Product" : "Add Product"}
        </button>
      </form>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {products.map((p) => (
          <div key={p._id} className="border p-2 rounded shadow">
            {p.image && (
              <img
                src={getImageUrl(p.image)}
                className="h-32 w-full object-cover mb-2"
                alt={p.name}
              />
            )}
            <h3 className="font-semibold">{p.name}</h3>
            <p className="text-gray-600">{p.category}</p>
            <p className="text-blue-700 font-bold mb-2">₹{p.price}</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(p)}
                className="bg-yellow-500 text-white py-1 px-2 rounded hover:bg-yellow-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(p._id)}
                className="bg-red-600 text-white py-1 px-2 rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
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
