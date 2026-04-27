import React from "react";
import { useNavigate } from "react-router-dom";

export default function LeaderWalk() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div
        style={{
          padding: "2rem",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        {/* Header Section */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "2rem",
            gap: "1rem",
          }}
        >
          <img
            src="/logo2.png"   // <-- Correct for public folder
            alt="Company Logo"
            style={{ height: "70px", objectFit: "contain" }}
          />
          <h1
            style={{
              fontSize: "2.5rem",
              margin: 0,
              color: "#004aad",
              fontWeight: "700",
            }}
          >
            Leadership Tools
          </h1>
        </div>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "1.3rem",
            marginBottom: "2rem",
            color: "#333",
          }}
        >
          Select a tool below.
        </p>

        {/* Buttons Container */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <button
            onClick={() => navigate("/documents")}
            style={buttonPrimary}
          >
            📁 Document Library
          </button>

          <button
            onClick={() => navigate("/training-scanner")}
            style={{
              ...buttonPrimary,
              backgroundColor: "#8a2be2",
            }}
          >
            📷 Training Attendance Scanner
          </button>

          <button disabled style={buttonDisabled}>
            Training Attendance (Coming Soon)
          </button>

          <button disabled style={buttonDisabled}>
            Document Signatures (Coming Soon)
          </button>
        </div>

        {/* Back Button */}
        <div style={{ marginTop: "3rem" }}>
          <button
            onClick={() => navigate("/dashboard")}
            style={backButton}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </Layout>
  );
}

/* ------------------ STYLES ------------------ */

const buttonPrimary = {
  padding: "1rem",
  fontSize: "1.4rem",
  backgroundColor: "#004aad",
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "600",
  boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
};

const buttonDisabled = {
  padding: "1rem",
  fontSize: "1.4rem",
  backgroundColor: "#999",
  color: "white",
  border: "none",
  borderRadius: "10px",
  opacity: 0.7,
};

const backButton = {
  padding: "0.8rem 1.2rem",
  fontSize: "1.2rem",
  backgroundColor: "#e0e0e0",
  color: "#333",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600",
};
