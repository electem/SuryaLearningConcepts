import { useState } from "react";
import { sendOTP, verifyOTP } from "../api/auth";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSendOTP = async () => {
    await sendOTP(phone);
    setStep(2);
  };

  const handleVerifyOTP = async () => {
    const res = await verifyOTP(phone, otp);
    login(res.data.token);
    navigate("/dashboard");
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow w-96">

        <h1 className="text-xl font-bold mb-4">OTP Login</h1>

        {step === 1 ? (
          <>
            <input
              className="w-full border p-2 mb-3"
              placeholder="Enter phone (+91...)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <button
              className="w-full bg-blue-500 text-white p-2 rounded"
              onClick={handleSendOTP}
            >
              Send OTP
            </button>
          </>
        ) : (
          <>
            <input
              className="w-full border p-2 mb-3"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <button
              className="w-full bg-green-500 text-white p-2 rounded"
              onClick={handleVerifyOTP}
            >
              Verify OTP
            </button>
          </>
        )}
      </div>
    </div>
  );
}