import React from "react";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";

export default function LeaderWalk() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
        Leadership Tools
      </h1>

      <p style={{ fontSize: "1.2rem", marginBottom: "2rem" }}>
        Select a tool below.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        
        {/* Document Library */}
        <button
          onClick={() => navigate("/documents")}
          style={{
            padding: "1rem",
            fontSize: "1.5rem",
            backgroundColor: "#004aad",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          Document Library
        </button>

        {/* Placeholder buttons for future tools */}
        <button
          disabled
          style={{
            padding: "1rem",
            fontSize: "1.5rem",
            backgroundColor: "#999",
            color: "white",
            border: "none",
            borderRadius: "8px"
          }}
        >
          Training Attendance (Coming Soon)
        </button>

        <button
          disabled
          style={{
            padding: "1rem",
            fontSize: "1.5rem",
            backgroundColor: "#999",
            color: "white",
            border: "none",
            borderRadius: "8px"
          }}
        >
          Document Signatures (Coming Soon)
        </button>

        <button
            onClick={() => navigate("/training-scanner")}
            style={{
                padding: "1rem",
                fontSize: "1.5rem",
                backgroundColor: "#8a2be2",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer"
            }}
        >
            Training Attendance Scanner
        </button>


      </div>
    </div>
  );
}
