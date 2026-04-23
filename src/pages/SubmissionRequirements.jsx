import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

export default function SubmissionRequirements() {
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  // =========================
  // FETCH REQUIREMENTS
  // =========================
  const fetchRequirements = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/submission-requirements`);
      const data = await res.json();

      const filtered = data.filter(
        (r) => r.month === Number(month) && r.year === Number(year)
      );

      setRecords(filtered);
    } catch (err) {
      console.error("Error fetching submission requirements:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, []);

  // =========================
  // UPDATE REQUIRED COUNT
  // =========================
  const updateRequirement = async (employee_id, required_count) => {
    try {
      await fetch(`${API_BASE}/submission-requirements`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id,
          year,
          month,
          required_count,
        }),
      });

      fetchRequirements();
    } catch (err) {
      console.error("Error updating requirement:", err);
    }
  };

  // =========================
  // DELETE ROW
  // =========================
  const deleteRequirement = async (employee_id) => {
    try {
      await fetch(`${API_BASE}/submission-requirements`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id,
          year,
          month,
        }),
      });

      fetchRequirements();
    } catch (err) {
      console.error("Error deleting requirement:", err);
    }
  };

  // =========================
  // RENDER
  // =========================
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "linear-gradient(135deg, #ffffff 0%, #f2f2f2 100%)",
        padding: "3rem",
        fontFamily: "Arial, sans-serif",
        boxSizing: "border-box",
      }}
    >
      {/* TOP BAR */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          maxWidth: "1200px",
          marginInline: "auto",
        }}
      >
        <h1
          style={{
            fontSize: "2.2rem",
            color: "#b30000",
            fontWeight: "bold",
            margin: 0,
          }}
        >
          Submission Requirements
        </h1>

        <button
          onClick={() => navigate("/admin")}
          style={{
            padding: "0.7rem 1.4rem",
            backgroundColor: "#b30000",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
            transition: "all 0.2s ease-in-out",
          }}
        >
          ← Back to Admin Dashboard
        </button>
      </div>

      {/* CONTENT AREA */}
      <div
        style={{
          maxWidth: "1200px",
          marginInline: "auto",
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      >
        <h2 style={{ marginBottom: "1rem", color: "#333" }}>
          Monthly Requirements
        </h2>

        {/* CONTROL BAR */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <label>
            <strong>Month:</strong>
          </label>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            style={{
              padding: "0.4rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          >
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>

          <label>
            <strong>Year:</strong>
          </label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            style={{
              padding: "0.4rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <button
            onClick={fetchRequirements}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#0066cc",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Load
          </button>
        </div>

        {/* TABLE */}
        {loading ? (
          <p style={{ color: "#666" }}>Loading...</p>
        ) : (
          <div style={{ maxHeight: "500px", overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ position: "sticky", top: 0, background: "#eee" }}>
                <tr>
                  <th style={thStyle}>Employee</th>
                  <th style={thStyle}>Leader</th>
                  <th style={thStyle}>Required Count</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {records.map((r) => (
                  <tr key={r.employee_id} style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={tdStyle}>{r.employee_name}</td>
                    <td style={tdStyle}>{r.leader_email || "—"}</td>
                    <td style={tdStyle}>
                      <input
                        type="number"
                        defaultValue={r.required_count}
                        onBlur={(e) =>
                          updateRequirement(r.employee_id, Number(e.target.value))
                        }
                        style={{
                          width: "70px",
                          padding: "0.3rem",
                          borderRadius: "4px",
                          border: "1px solid #ccc",
                        }}
                      />
                    </td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => deleteRequirement(r.employee_id)}
                        style={{
                          padding: "0.3rem 0.6rem",
                          backgroundColor: "#b30000",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "0.9rem",
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const thStyle = {
  padding: "8px",
  borderBottom: "2px solid #ccc",
  textAlign: "left",
  fontWeight: "bold",
};

const tdStyle = {
  padding: "8px",
};
