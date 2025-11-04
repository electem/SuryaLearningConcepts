import { useEffect, useState } from "react";
import api from "../api/axiosInstance";

export default function Dashboard() {
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    // ✅ Fetch email stored during signup or login
    const storedEmail = localStorage.getItem("email");
    if (storedEmail) setEmail(storedEmail);
  }, []);

  const sendNotification = async () => {
    if (!email) {
      alert("⚠️ No email found in localStorage!");
      return;
    }

    try {
      // ✅ match backend route: /api/notifications/create
      await api.post("/api/notifications/create", {
        to: email,
        subject: "Welcome Notification",
        body: `Hi ${email}, this is your test notification!`,
      });

      alert(`✅ Notification scheduled successfully for ${email}`);
    } catch (err: any) {
      console.error("Notification error:", err);
      alert(err.response?.data?.error || "❌ Error sending notification");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Welcome!</h1>
      <p className="mb-4 text-lg">Email: {email || "Not available"}</p>
      <button
        onClick={sendNotification}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
      >
        Send Notification
      </button>
    </div>
  );
}
