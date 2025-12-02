import React, { useState } from "react";
import UploadForm from "./components/UploadForm";
import Chat from "./components/Chat";
import { motion } from "framer-motion";

export default function App() {
  const [uploaded, setUploaded] = useState(false);

  return (
    <div className="min-h-screen bg-[#0f1522] text-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <motion.h1
          className="text-4xl font-extrabold mb-10 text-center bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          PDF Chat AI
        </motion.h1>

        <UploadForm onUploaded={() => setUploaded(true)} />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Chat enabled={uploaded} />
        </motion.div>
      </div>
    </div>
  );
}
