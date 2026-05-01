import React from "react";
import { useNavigate } from "react-router-dom";

export default function LeaderWalk() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "1100px",
        margin: "0 auto",
      }}
    >
      {/* HEADER BAR */}
      <div
        style={{
          background: "#333333",
          padding: "16px 20px",
          borderRadius: "8px",
          marginBottom: "24px",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 3px 8px rgba(0,0,0,0.25)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "600" }}>
          Leadership Tools
        </h1>

        <button
          onClick={() => navigate("/dashboard")}
          style={{
            padding: "8px 14px",
            background: "#B30000",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* SUBTITLE */}
      <p
        style={{
          fontSize: "1.3rem",
          marginBottom: "20px",
          color: "#333",
          fontWeight: "500",
        }}
      >
        Select a tool below.
      </p>

      {/* TOOL GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "16px",
        }}
      >
        {/* Leadership Walk */}
        <ToolButton
          label="🚶 Leadership Gemba Walk"
          sub="Coming Soon"
          onClick={() => navigate("/leadership-walk")}
        />

        {/* Document Library */}
        <ToolButton
          label="📁 Document Library"
          onClick={() => navigate("/documents")}
        />

        {/* Open Action Items */}
        <ToolButton
          label="📋 Open Action Items"
          sub="Coming Soon"
          onClick={() => navigate("/action-items")}
        />

        {/* Incident Investigation */}
        <ToolButton
          label="⚠️ Incident Investigation"
          sub="Coming Soon"
          onClick={() => navigate("/incident-investigation")}
        />

        {/* Continuous Improvement Tools */}
        <ToolButton
          label="🔧 Continuous Improvement Tools"
          sub="Coming Soon"
          onClick={() => navigate("/ci-tools")}
        />

        {/* Training Attendance Scanner */}
        <ToolButton
          label="📷 Training Attendance Scanner"
          color="#8a2be2"
          onClick={() => navigate("/training-scanner")}
        />

        {/* Training Attendance Reports */}
        <ToolButton
          label="📝 Training Attendance Reports"
          onClick={() => navigate("/training-attendance")}
        />

        {/* Disabled Feature */}
        <ToolButton
          label="✍️ Document Signatures"
          disabled
          sub="Coming Soon"
        />
      </div>
    </div>
  );
}

/* ------------------ REUSABLE TOOL BUTTON ------------------ */

function ToolButton({ label, sub, onClick, disabled, color }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "18px 20px",
        textAlign: "left",
        background: disabled ? "#999" : color || "#800000",
        color: "white",
        border: "none",
        borderRadius: "10px",
        cursor: disabled ? "not-allowed" : "pointer",
        fontWeight: "600",
        fontSize: "1.3rem",
        boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        opacity: disabled ? 0.7 : 1,
      }}
    >
      {label}
      {sub && (
        <span
          style={{
            fontSize: "0.9rem",
            fontWeight: "400",
            opacity: 0.9,
          }}
        >
          {sub}
        </span>
      )}
    </button>
  );
}
