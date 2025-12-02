import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function Chat({ enabled }) {
  const [q, setQ] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const ask = async () => {
    if (!q.trim()) return;
    const question = q.trim();

    setMessages((p) => [...p, { from: "user", text: question }]);
    setQ("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:4000/api/query", { question });
      setMessages((p) => [...p, { from: "bot", text: res.data.answer }]);
    } catch (err) {
      setMessages((p) => [...p, { from: "bot", text: "[Error] " + err.message }]);
    } finally {
      setLoading(false);
    }
  };

  if (!enabled)
    return (
      <p className="text-gray-400 text-center mt-10">
        Upload a PDF to begin chatting.
      </p>
    );

  return (
    <motion.div
      className="backdrop-blur-xl bg-white/10 border border-white/10 p-6 rounded-2xl shadow-lg"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="h-72 overflow-auto border border-white/10 rounded-lg p-4 bg-black/20">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`my-3 ${
              m.from === "user" ? "text-right" : "text-left"
            }`}
          >
            <span
              className={`inline-block px-3 py-2 rounded-xl text-sm ${
                m.from === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-200"
              }`}
            >
              {m.text}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-3 mt-4">
        <input
          className="flex-1 p-3 bg-black/30 border border-white/10 rounded-xl text-gray-200 placeholder-gray-500"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          placeholder="Ask anything from your PDF..."
        />

        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={ask}
          disabled={loading}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl shadow text-white font-semibold"
        >
          {loading ? "..." : "Ask"}
        </motion.button>
      </div>
    </motion.div>
  );
}
