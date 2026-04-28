import React, { useState, useEffect } from "react";
import useReportData from "../../hooks/useReportData";

export default function ReportViewer({ report, onBack }) {
  const backendUrl = "https://safetyapp-backend-docker.onrender.com";

  const { rows, loading, loadReport } = useReportData();

  const [filter, setFilter] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  // Load report details on mount
  useEffect(() => {
    loadReport(report.id);
  }, [report]);

  // Filter rows
  const filteredRows = rows.filter((r) => {
    const text = `${r.employee_id} ${r.name || ""}`.toLowerCase();
    return text.includes(filter.toLowerCase());
  });

  // Sort rows
  const sortedRows = [...filteredRows].sort((a, b) => {
    if (!sortField) return 0;

    const valA = a[sortField] || "";
    const valB = b[sortField] || "";

    if (valA < valB) return sortDir === "asc" ? -1 : 1;
    if (valA > valB) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  // Handle sorting
  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  // Export to CSV
  const exportCSV = () => {
    const header =
      report.type === "PLANT_MEETING"
        ? "Employee ID,Name,Attended\n"
        : "Employee ID,Name,Scanned At\n";

    const body = sortedRows
      .map((r) => {
        if (report.type === "PLANT_MEETING") {
          return `${r.employee_id},${r.name},${r.attended ? "Yes" : "No"}`;
        }
        return `${r.employee_id},${r.name},${r.scanned_at}`;
      })
      .join("\n");

    const csv = header + body;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.title}.csv`;
    a.click();
  };

  return (
    <div>
      <button
        onClick={onBack}
        style={{
          padding: "0.7rem 1.2rem",
          backgroundColor: "#555",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          marginBottom: "1.5rem",
        }}
      >
        ← Back
      </button>

      <h2 style={{ marginBottom: "0.5rem" }}>{report.title}</h2>
      <p style={{ color: "#666", marginBottom: "1.5rem" }}>
        Report ID: {report.id}
      </p>

      {/* FILTER */}
      <input
        type="text"
        placeholder="Filter by employee ID or name..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{
          padding: "0.8rem",
          fontSize: "1.1rem",
          width: "100%",
          marginBottom: "1.5rem",
        }}
      />

      {/* EXPORT */}
      <button
        onClick={exportCSV}
        style={{
          padding: "0.7rem 1.2rem",
          backgroundColor: "#004aad",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          marginBottom: "1.5rem",
        }}
      >
        Export to CSV
      </button>

      {/* TABLE */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "1.1rem",
          }}
        >
          <thead>
            <tr>
              <th
                onClick={() => toggleSort("employee_id")}
                style={{ cursor: "pointer", borderBottom: "2px solid #ccc" }}
              >
                Employee ID
              </th>

              <th
                onClick={() => toggleSort("name")}
                style={{ cursor: "pointer", borderBottom: "2px solid #ccc" }}
              >
                Name
              </th>

              {report.type === "PLANT_MEETING" ? (
                <th
                  onClick={() => toggleSort("attended")}
                  style={{ cursor: "pointer", borderBottom: "2px solid #ccc" }}
                >
                  Attended
                </th>
              ) : (
                <th
                  onClick={() => toggleSort("scanned_at")}
                  style={{ cursor: "pointer", borderBottom: "2px solid #ccc" }}
                >
                  Scanned At
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {sortedRows.map((row, idx) => (
              <tr key={idx}>
                <td style={{ padding: "0.6rem", borderBottom: "1px solid #eee" }}>
                  {row.employee_id}
                </td>

                <td style={{ padding: "0.6rem", borderBottom: "1px solid #eee" }}>
                  {row.name}
                </td>

                {report.type === "PLANT_MEETING" ? (
                  <td style={{ padding: "0.6rem", borderBottom: "1px solid #eee" }}>
                    {row.attended ? "Yes" : "No"}
                  </td>
                ) : (
                  <td style={{ padding: "0.6rem", borderBottom: "1px solid #eee" }}>
                    {row.scanned_at}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
