import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function UploadForm({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Please select a PDF file first");

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:4000/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(`Upload processed: ${res.data.chunksInserted} chunks`);
      onUploaded?.();
      setFile(null);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Unknown error occurred during upload";
      alert("Upload failed: " + message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="backdrop-blur-xl bg-white/10 border border-white/10 p-6 rounded-2xl shadow-lg mb-8"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="font-semibold mb-3 text-xl text-blue-300">Upload PDF</h2>

      <div className="flex flex-col gap-3">
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
          className="text-gray-300"
        />

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleUpload}
          disabled={loading}
          className={`px-4 py-2 rounded-lg text-white font-semibold transition-all ${
            loading
              ? "bg-gray-700 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 shadow-md"
          }`}
        >
          {loading ? "Uploading..." : "Upload & Index"}
        </motion.button>

        {file && (
          <p className="text-sm text-gray-400">Selected: {file.name}</p>
        )}
      </div>
    </motion.div>
  );
}
