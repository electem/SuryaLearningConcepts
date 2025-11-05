import { useState } from "react";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [phone, setPhone] = useState(""); 

 const sendNotification = async (type: "email" | "sms" | "whatsapp") => {
  try {
    const payload: any = {
      subject: "Test Notification",
      body: `Hi! This is your ${type.toUpperCase()} test message.`,
    };  

    if (type === "email") { 
      if (!user?.email) {
        alert("⚠️ No email found!");
        return;
      }
      payload.to = user.email;
    } else if (type === "sms") {
      if (!phone) {
        alert("⚠️ Please enter a phone number!");
        return;
      }
      payload.smsNumber = phone;
    } else if (type === "whatsapp") {
      if (!phone) {
        alert("⚠️ Please enter a phone number!");
        return;
      }
      payload.whatsAppNumber = phone;
    }

    await api.post("/api/notifications/create", payload);
    alert(`✅ ${type.toUpperCase()} message sent successfully!`);
  } catch (err: any) {
    console.error(`${type} notification error:`, err);
    alert(err.response?.data?.error || `❌ Error sending ${type} message`);
  }
};


  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Welcome!</h1>
      <p className="mb-2 text-lg">Email: {user?.email || "Not available"}</p>

      {/* Input for phone number */}
      <input
        type="text"
        placeholder="(e.g. +919876543210)"
        className="border p-2 rounded w-80 mb-4"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <div className="flex flex-col gap-2">
        <button
          onClick={() => sendNotification("email")}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          Send Email
        </button>

        <button
          onClick={() => sendNotification("sms")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Send SMS
        </button>

        <button
          onClick={() => sendNotification("whatsapp")}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
        >
          Send WhatsApp
        </button>

        <button
          onClick={logout}
          className="bg-red-600 text-white mt-4 px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
