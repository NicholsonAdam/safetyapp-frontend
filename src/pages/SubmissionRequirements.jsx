import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

export default function SubmissionRequirements() {
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const [leaderFilter, setLeaderFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "employee_id", direction: "asc" });

  // =========================
  // FETCH REQUIREMENTS + PROGRESS
  // =========================
  const fetchRequirements = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_BASE}/submission-requirements/progress?month=${month}&year=${year}`
      );
      const data = await res.json();
      setRecords(data || []);
    } catch (err) {
      console.error("Error fetching submission requirements:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  // SORT HANDLER
  // =========================
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return "";
    return sortConfig.direction === "asc" ? " ▲" : " ▼";
  };

  // =========================
  // FILTER + SEARCH + SORTED VIEW
  // =========================
  const processedRecords = useMemo(() => {
    let data = [...records];

    // Leader filter
    if (leaderFilter) {
      data = data.filter((r) => r.leader_name === leaderFilter);
    }

    // Search (employee id or name)
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      data = data.filter((r) => {
        const idMatch = String(r.employee_id || "").toLowerCase().includes(term);
        const nameMatch = (r.employee_name || "").toLowerCase().includes(term);
        return idMatch || nameMatch;
      });
    }

    // Sort
    if (sortConfig.key) {
      data.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (aVal == null && bVal != null) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal != null && bVal == null) return sortConfig.direction === "asc" ? 1 : -1;
        if (aVal == null && bVal == null) return 0;

        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
        }

        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        if (aStr < bStr) return sortConfig.direction === "asc" ? -1 : 1;
        if (aStr > bStr) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [records, leaderFilter, searchTerm, sortConfig]);

  // =========================
  // LEADER OPTIONS
  // =========================
  const leaderOptions = useMemo(() => {
    const set = new Set();
    records.forEach((r) => {
      if (r.leader_name) set.add(r.leader_name);
    });
    return Array.from(set).sort();
  }, [records]);

  // =========================
  // RESET FILTERS
  // =========================
  const resetFilters = () => {
    setLeaderFilter("");
    setSearchTerm("");
    setSortConfig({ key: "employee_id", direction: "asc" });
  };

  // =========================
  // EXPORT TO EXCEL (CSV)
  // =========================
  const exportToExcel = () => {
    if (!processedRecords.length) return;

    const header = [
      "Employee ID",
      "Employee Name",
      "Leader Name",
      "Required Count",
      "Actual Submissions",
      "Progress (%)",
    ];

    const rows = processedRecords.map((r) => {
      const actual = r.actual_submissions || 0;
      const required = r.required_count || 0;
      const pct = required > 0 ? ((actual / required) * 100).toFixed(1) : "0.0";
      return [
        r.employee_id,
        r.employee_name,
        r.leader_name || "",
        required,
        actual,
        pct,
      ];
    });

    const csvContent =
      [header, ...rows]
        .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const fileMonth = String(month).padStart(2, "0");
    link.download = `submission_requirements_${fileMonth}_${year}.csv`;
    link.click();
    URL.revokeObjectURL(url);
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
            flexWrap: "wrap",
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
            onChange={(e) => setMonth(Number(e.target.value))}
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
            onChange={(e) => setYear(Number(e.target.value))}
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

          {/* Leader Filter */}
          <label style={{ marginLeft: "1rem" }}>
            <strong>Leader:</strong>
          </label>
          <select
            value={leaderFilter}
            onChange={(e) => setLeaderFilter(e.target.value)}
            style={{
              padding: "0.4rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
              minWidth: "160px",
            }}
          >
            <option value="">All Leaders</option>
            {leaderOptions.map((leader) => (
              <option key={leader} value={leader}>
                {leader}
              </option>
            ))}
          </select>

          {/* Search */}
          <input
            type="text"
            placeholder="Search by ID or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "0.4rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
              flexGrow: 1,
              minWidth: "200px",
            }}
          />

          {/* Reset + Export */}
          <button
            onClick={resetFilters}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#777",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Reset Filters
          </button>

          <button
            onClick={exportToExcel}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#008000",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Export to Excel
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
                  <th style={thStyle} onClick={() => handleSort("employee_id")}>
                    Employee ID{getSortIndicator("employee_id")}
                  </th>
                  <th style={thStyle} onClick={() => handleSort("employee_name")}>
                    Employee{getSortIndicator("employee_name")}
                  </th>
                  <th style={thStyle} onClick={() => handleSort("leader_name")}>
                    Leader{getSortIndicator("leader_name")}
                  </th>
                  <th style={thStyle} onClick={() => handleSort("required_count")}>
                    Required Count{getSortIndicator("required_count")}
                  </th>
                  <th style={thStyle} onClick={() => handleSort("actual_submissions")}>
                    Progress{getSortIndicator("actual_submissions")}
                  </th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {processedRecords.map((r) => {
                  const actual = r.actual_submissions || 0;
                  const required = r.required_count || 0;
                  const pct =
                    required > 0 ? ((actual / required) * 100).toFixed(1) : "0.0";

                  // Simple color coding
                  let progressColor = "#999";
                  if (required > 0) {
                    if (actual >= required) progressColor = "#008000";
                    else if (actual >= required * 0.5) progressColor = "#e6a800";
                    else progressColor = "#b30000";
                  }

                  return (
                    <tr
                      key={r.employee_id}
                      style={{ borderBottom: "1px solid #ddd" }}
                    >
                      <td style={tdStyle}>{r.employee_id}</td>
                      <td style={tdStyle}>{r.employee_name}</td>
                      <td style={tdStyle}>{r.leader_name || "—"}</td>
                      <td style={tdStyle}>
                        <input
                          type="number"
                          defaultValue={required}
                          onBlur={(e) =>
                            updateRequirement(
                              r.employee_id,
                              Number(e.target.value)
                            )
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
                        <div style={{ color: progressColor, fontWeight: "bold" }}>
                          {actual} / {required}{" "}
                          <span style={{ marginLeft: "4px", fontWeight: "normal" }}>
                            ({pct}%)
                          </span>
                        </div>
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
                          Delete Requirement
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {!processedRecords.length && !loading && (
                  <tr>
                    <td style={tdStyle} colSpan={6}>
                      No records match the current filters.
                    </td>
                  </tr>
                )}
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
  cursor: "pointer",
  userSelect: "none",
};

const tdStyle = {
  padding: "8px",
};
