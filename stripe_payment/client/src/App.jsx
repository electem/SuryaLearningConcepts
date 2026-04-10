import axios from "axios";
import { useState } from "react";

function App() {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:3000/create-checkout-session"
      );

      window.location.href = res.data.url;
    } catch (err) {
      alert("Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Stripe Payment Demo 💳</h1>
        <p style={styles.subtitle}>
          Secure test payment using Stripe Checkout
        </p>

        <button onClick={handlePayment} style={styles.button}>
          {loading ? "Processing..." : "Pay $5 Now"}
        </button>

        <p style={styles.note}>Test Card: 4242 4242 4242 4242</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0f172a",
    fontFamily: "Arial",
  },
  card: {
    background: "#1e293b",
    padding: "40px",
    borderRadius: "16px",
    textAlign: "center",
    width: "350px",
    color: "white",
    boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
  },
  title: {
    marginBottom: "10px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#94a3b8",
    marginBottom: "20px",
  },
  button: {
    padding: "12px 20px",
    fontSize: "16px",
    background: "#22c55e",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    color: "white",
    width: "100%",
  },
  note: {
    marginTop: "15px",
    fontSize: "12px",
    color: "#64748b",
  },
};

export default App;