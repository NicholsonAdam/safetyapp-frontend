import React from "react";

export default function ReportList({ reports, onOpen }) {
  return (
    <div>
      <h2 style={{ marginBottom: "1rem" }}>Available Reports</h2>

      {reports.length === 0 && (
        <p style={{ fontSize: "1.2rem" }}>No reports found.</p>
      )}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {reports.map((r) => (
          <li
            key={r.id}
            style={{
              padding: "1rem",
              marginBottom: "1rem",
              border: "1px solid #ccc",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: "1.3rem", fontWeight: "bold" }}>
                {r.title}
              </div>

              <div style={{ fontSize: "1rem", color: "#555" }}>
                Created: {new Date(r.created_at).toLocaleString()}
              </div>
            </div>

            <button
              onClick={() => onOpen(r)}
              style={{
                padding: "0.7rem 1.2rem",
                backgroundColor: "#004aad",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              Open
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
