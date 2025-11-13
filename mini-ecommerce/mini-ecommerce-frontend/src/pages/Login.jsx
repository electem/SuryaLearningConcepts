import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();

  // ✅ Send OTP
  const sendOtp = async () => {
    if (!phone.startsWith("+91")) {
      alert("Please include country code, e.g. +91xxxxxxxxxx");
      return;
    }
    try {
      setLoading(true);
      await api.post("/auth/send-otp", { phone });
      setStep(2);
      alert("OTP sent! Check your phone.");
    } catch (err) {
      alert("Failed to send OTP. Try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Verify OTP
 const verifyOtp = async () => {
  if (!code.trim()) {
    alert("Please enter the OTP you received.");
    return;
  }
  try {
    setLoading(true);
    const res = await api.post("/auth/verify-otp", { phone, code });

    // Save token and user info
    loginWithToken(res.data.token);
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("userId", res.data.user._id);
    localStorage.setItem("role", res.data.user.role); // save role if needed

    alert("Login successful!");

    // ✅ Redirect based on role
    if (res.data.user.role === "owner") {
      navigate("/owner"); // Owner dashboard
    } else {
      navigate("/home"); // Regular user
    }

  } catch (err) {
    alert("Invalid OTP or expired code.");
    console.error(err);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="max-w-md mx-auto p-4 text-center">
      {step === 1 && (
        <>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border p-2 w-full mb-2"
            placeholder="Enter phone (e.g. +91XXXXXXXXXX)"
          />
          <button
            disabled={loading}
            onClick={sendOtp}
            className="bg-blue-600 text-white px-4 py-2 rounded w-full"
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </>
      )}
      {step === 2 && (
        <>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="border p-2 w-full mb-2"
            placeholder="Enter 6-digit OTP"
          />
          <button
            disabled={loading}
            onClick={verifyOtp}
            className="bg-green-600 text-white px-4 py-2 rounded w-full"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </>
      )}
    </div>
  );
}
