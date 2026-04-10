// Login.js
import React from "react";

function Login() {
  const handleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google";
  };

  return (
    <div>
      <h2>Login</h2>
      <button onClick={handleLogin}>
        Login with Google
      </button>
    </div>
  );
}

export default Login;