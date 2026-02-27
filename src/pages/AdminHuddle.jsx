import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

export default function AdminHuddle() {
  const navigate = useNavigate();

  // MODE: employee | week
  const [mode, setMode] = useState("employee");

  // FILTERS
  const [department, setDepartment] = useState("");
  const [leader, setLeader] = useState("");

  // EMPLOYEE MASTER LIST (for filters)
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [leaders, setLeaders] = useState([]);

  // EMPLOYEE SEARCH
  const [employeeId, setEmployeeId] = useState("");
  const [employeeData, setEmployeeData] = useState(null);

  // WEEK SEARCH
  const [week, setWeek] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [weekData, setWeekData] = useState(null);

  const cell = {
    padding: "0.75rem",
    borderBottom: "1px solid #ddd",
    textAlign: "center",
  };

  const thStyle = {
    padding: "0.75rem",
    borderBottom: "2px solid #ccc",
    textAlign: "left",
    fontWeight: "bold",
    position: "sticky",
    top: 0,
    backgroundColor: "#eee",
    zIndex: 2,
  };

  // LOAD ALL EMPLOYEES
  useEffect(() => {
    fetch("https://safetyapp-backend-xq88.onrender.com/api/employees")
      .then((res) => res.json())
      .then((data) => {
        setEmployees(data);

        const uniqueDepts = [...new Set(data.map((e) => e.department).filter(Boolean))];
        setDepartments(uniqueDepts);

        const leaderMap = {};
        data.forEach((emp) => {
          const leaderId = emp.leader_id;
          if (!leaderId) return;

          const leaderEmp = data.find((e) => e.employee_id === leaderId);
          if (leaderEmp) {
            leaderMap[leaderEmp.employee_id] = leaderEmp.name;
          }
        });

        const leaderList = Object.entries(leaderMap).map(([id, name]) => ({
          employee_id: id,
          name,
        }));

        setLeaders(leaderList);
      });
  }, []);

  // FETCH EMPLOYEE DATA
  const searchEmployee = async (leaderOverride = "", deptOverride = "") => {
    if (!employeeId.trim()) return;

    const res = await fetch(
      `https://safetyapp-backend-xq88.onrender.com/api/huddles/employee/${employeeId}?department=${deptOverride}&leader=${leaderOverride}`
    );
    const data = await res.json();
    setEmployeeData(data);
  };

  // FETCH WEEK DATA
  const searchWeek = async (leaderOverride = "", deptOverride = "") => {
    if (!week) return;

    const res = await fetch(
      `https://safetyapp-backend-xq88.onrender.com/api/huddles/week/${year}/${week}?department=${deptOverride}&leader=${leaderOverride}`
    );
    const data = await res.json();
    setWeekData(data);
  };

  // EXPORT FULL YEAR
  const exportAllToExcel = async () => {
    const res = await fetch(
      `https://safetyapp-backend-xq88.onrender.com/api/huddles/full-year?year=${year}&department=${department}&leader=${leader}`
    );

    if (!res.ok) {
      alert("Backend route /full-year not implemented yet.");
      return;
    }

    const data = await res.json();

    const ws = XLSX.utils.json_to_sheet(data.rows);

    // Auto-size columns
    const colWidths = Object.keys(data.rows[0]).map((key) => {
      const maxLength = Math.max(
        key.length,
        ...data.rows.map((row) => (row[key] ? row[key].toString().length : 0))
      );
      return { wch: maxLength + 2 };
    });

    ws["!cols"] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Huddles");

    XLSX.writeFile(wb, `SafetyHuddles_${year}.xlsx`);
  };

  // AUTO REFRESH
  const autoRefresh = () => {
    if (mode === "employee" && employeeData) {
      searchEmployee();
    }
    if (mode === "week" && weekData) {
      searchWeek();
    }
  };

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
          Safety Huddle Records
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

      {/* CONTENT CARD */}
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
        {/* EXPORT BUTTON */}
        <button
          onClick={exportAllToExcel}
          style={{
            padding: "0.6rem 1rem",
            backgroundColor: "#0066cc",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            marginBottom: "1.5rem",
          }}
        >
          Export Full Year to Excel
        </button>

        {/* MODE SWITCH + FILTERS (Option A) */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "1.5rem",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => setMode("employee")}
            style={{
              padding: "0.6rem 1rem",
              backgroundColor: mode === "employee" ? "#b30000" : "#ccc",
              color: mode === "employee" ? "white" : "black",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Search by Employee
          </button>

          <button
            onClick={() => setMode("week")}
            style={{
              padding: "0.6rem 1rem",
              backgroundColor: mode === "week" ? "#b30000" : "#ccc",
              color: mode === "week" ? "white" : "black",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Search by Week
          </button>

          {/* Department Filter */}
          <select
            value={department}
            onChange={(e) => {
              const newDept = e.target.value;
              setDepartment(newDept);

              if (mode === "employee" && employeeData) {
                searchEmployee(leader, newDept);
              }
              if (mode === "week" && weekData) {
                searchWeek(leader, newDept);
              }
            }}
            style={{
              padding: "0.5rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Leader Filter */}
          <select
            value={leader}
            onChange={(e) => {
              const newLeader = e.target.value;
              setLeader(newLeader);

              if (mode === "employee" && employeeData) {
                searchEmployee(newLeader, department);
              }
              if (mode === "week" && weekData) {
                searchWeek(newLeader, department);
              }
            }}
            style={{
              padding: "0.5rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          >
            <option value="">All Leaders</option>
            {leaders.map((l) => (
              <option key={l.employee_id} value={l.employee_id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        {/* EMPLOYEE SEARCH */}
        {mode === "employee" && (
          <>
            <h2 style={{ marginBottom: "1rem", color: "#333" }}>
              Search by Employee ID
            </h2>

            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
              <input
                type="text"
                placeholder="Enter Employee ID"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchEmployee()}
                style={{
                  padding: "0.5rem",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  width: "200px",
                }}
              />

              <button
                onClick={() => searchEmployee(leader, department)}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#b30000",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Search
              </button>
            </div>

            {employeeData && (
              <>
                <h3 style={{ marginBottom: "1rem" }}>
                  {employeeData.employee.name} ({employeeData.employee.employee_id})
                </h3>

                <div
                  style={{
                    maxHeight: "600px",
                    overflowY: "auto",
                    marginTop: "1rem",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                    }}
                  >
                    <thead>
                      <tr>
                        <th style={thStyle}>Week</th>
                        <th style={thStyle}>Required</th>
                        <th style={thStyle}>Signed</th>
                        <th style={thStyle}>Signed At</th>
                        <th style={thStyle}>PDF</th>
                      </tr>
                    </thead>

                    <tbody>
                      {employeeData.huddles.map((h) => (
                        <tr key={h.week}>
                          <td style={cell}>{h.week}</td>
                          <td style={cell}>
                            {h.required ? (
                              <span style={{ color: "#b30000", fontWeight: "bold" }}>
                                YES
                              </span>
                            ) : (
                              <span style={{ color: "gray" }}>No</span>
                            )}
                          </td>
                          <td style={cell}>
                            {h.signed ? (
                              <span style={{ color: "green", fontWeight: "bold" }}>
                                ✔ Signed
                              </span>
                            ) : h.required ? (
                              <span style={{ color: "#b30000", fontWeight: "bold" }}>
                                ✘ Missing
                              </span>
                            ) : (
                              <span style={{ color: "gray" }}>N/A</span>
                            )}
                          </td>
                          <td style={cell}>
                            {h.signed_at
                              ? new Date(h.signed_at).toLocaleString()
                              : "-"}
                          </td>
                          <td style={cell}>
                            <a href={h.pdf_url} target="_blank">
                              View PDF
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}

        {/* WEEK SEARCH */}
        {mode === "week" && (
          <>
            <h2 style={{ marginBottom: "1rem", color: "#333" }}>
              Search by Week
            </h2>

            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
              <input
                type="number"
                placeholder="Week #"
                value={week}
                onChange={(e) => setWeek(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchWeek()}
                style={{
                  padding: "0.5rem",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  width: "100px",
                }}
              />

              <input
                type="number"
                placeholder="Year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchWeek()}
                style={{
                  padding: "0.5rem",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  width: "120px",
                }}
              />

              <button
                onClick={() => searchWeek(leader, department)}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#b30000",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Search
              </button>
            </div>

            {weekData && (
              <>
                <h3 style={{ marginBottom: "1rem" }}>
                  Week {weekData.week}, {weekData.year}
                </h3>

                <div
                  style={{
                    maxHeight: "600px",
                    overflowY: "auto",
                    marginTop: "1rem",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                    }}
                  >
                    <thead>
                      <tr>
                        <th style={thStyle}>Employee</th>
                        <th style={thStyle}>Required</th>
                        <th style={thStyle}>Signed</th>
                        <th style={thStyle}>Signed At</th>
                      </tr>
                    </thead>

                    <tbody>
                      {weekData.employees.map((e) => (
                        <tr key={e.employee_id}>
                          <td style={cell}>
                            {e.name} ({e.employee_id})
                          </td>
                          <td style={cell}>
                            {e.required ? (
                              <span style={{ color: "#b30000", fontWeight: "bold" }}>
                                YES
                              </span>
                            ) : (
                              <span style={{ color: "gray" }}>No</span>
                            )}
                          </td>
                          <td style={cell}>
                            {e.signed ? (
                              <span style={{ color: "green", fontWeight: "bold" }}>
                                ✔ Signed
                              </span>
                            ) : e.required ? (
                              <span style={{ color: "#b30000", fontWeight: "bold" }}>
                                ✘ Missing
                              </span>
                            ) : (
                              <span style={{ color: "gray" }}>N/A</span>
                            )}
                          </td>
                          <td style={cell}>
                            {e.signed_at
                              ? new Date(e.signed_at).toLocaleString()
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}