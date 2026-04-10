import React, { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/me", {
      withCredentials: true
    })
    .then(res => {
      console.log("Dashboard user:", res.data);
      setUser(res.data);
    })
    .catch(err => {
      console.error("Dashboard fetch error:", err);
      setError(err.response?.data || err.message);
    })
    .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  if (error) {
    return <div>Error loading dashboard: {String(error)}</div>;
  }

  return (
    <div>
      <h2>Dashboard</h2>

      {user ? (
        <>
          <h1>Welcome, {user.name}!</h1>
          {user.picture ? (
            <img
              src={user.picture}
              alt={`${user.name} avatar`}
              width="100"
              height="100"
              style={{ display: "block", margin: "16px auto", borderRadius: "50%" }}
              onError={(e) => {
                console.error("Profile image failed to load:", e.currentTarget.src);
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <p>No profile picture available.</p>
          )}
          <p>{user.email}</p>
        </>
      ) : (
        <p>No user data available.</p>
      )}
    </div>
  );
}

export default Dashboard;