function Success() {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>🎉 Payment Successful!</h1>
        <p>Thank you for your payment.</p>
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
    color: "white",
  },
  card: {
    textAlign: "center",
    background: "#1e293b",
    padding: "40px",
    borderRadius: "12px",
  },
};

export default Success;