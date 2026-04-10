import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { uploadImage, getImages } from "../api/image";

export default function Dashboard() {
  const { token, logout } = useContext(AuthContext);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [images, setImages] = useState([]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleUpload = async () => {
    if (!file) return alert("Select a file");

    await uploadImage(file, token);
    setFile(null);
    setPreview(null);
    fetchImages();
  };

  const fetchImages = async () => {
    const res = await getImages(token);
    setImages(res.data);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Upload Section */}
      <div className="mt-4">
        <input type="file" onChange={handleFileChange} />

        {preview && (
          <img
            src={preview}
            alt="preview"
            className="w-40 mt-3 rounded"
          />
        )}

        <button
          className="bg-blue-500 text-white px-4 py-2 mt-3"
          onClick={handleUpload}
        >
          Upload Image
        </button>
      </div>

      {/* Logout */}
      <button
        className="bg-red-500 text-white px-4 py-2 mt-4 ml-2"
        onClick={logout}
      >
        Logout
      </button>

      {/* Image Grid */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        {images.map((img) => (
          <img
            key={img._id}
            src={img.imageUrl}
            alt=""
            className="w-full h-40 object-cover rounded"
          />
        ))}
      </div>
    </div>
  );
}