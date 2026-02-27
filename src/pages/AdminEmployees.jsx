import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import SlideInPanel from "../components/SlideInPanel";

export default function AdminEmployees() {
  const navigate = useNavigate();

  // EMPLOYEE DATA
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // SLIDE-IN PANEL STATE
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState(null); // "add" | "edit"
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // FORM STATE (USED FOR BOTH ADD + EDIT)
  const [formData, setFormData] = useState({
    employee_id: "",
    name: "",
    department: "",
    job_title: "",
    shift: "",
    leader_id: "",
    email: "",
    site_admin: "",
  });

  // FILTER + SEARCH STATE
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // SORTING STATE
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  })

  // FETCH EMPLOYEES
  const loadEmployees = () => {
    fetch("https://safetyapp-backend-xq88.onrender.com/api/employees")
      .then((res) => res.json())
      .then((data) => {
        setEmployees(
          data.map((emp) => ({
            ...emp,
            active:
              emp.active === true ||
              emp.active === "true" ||
              emp.active === "t",
          }))
        );
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading employees:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  // HANDLE FORM INPUT
  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // SUBMIT ADD EMPLOYEE
  const submitAddEmployee = async () => {
    try {
      const res = await fetch("https://safetyapp-backend-xq88.onrender.com/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        alert("Error adding employee");
        return;
      }

      setIsPanelOpen(false);
      loadEmployees();
    } catch (err) {
      console.error("Add employee error:", err);
    }
  };

  // SUBMIT EDIT EMPLOYEE
  const submitEditEmployee = async () => {
    try {
      const res = await fetch(
        `https://safetyapp-backend-xq88.onrender.com/api/employees/${selectedEmployee.employee_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!res.ok) {
        alert("Error updating employee");
        return;
      }

      setIsPanelOpen(false);
      loadEmployees();
    } catch (err) {
      console.error("Edit employee error:", err);
    }
  };

  // OPEN EDIT PANEL
  const openEditPanel = (emp) => {
    setSelectedEmployee(emp);
    setPanelMode("edit");

    setFormData({
      employee_id: emp.employee_id,
      name: emp.name,
      department: emp.department,
      job_title: emp.job_title,
      shift: emp.shift,
      leader_id: emp.leader_id,
      email: emp.email,
      site_admin: emp.site_admin,
    });

    setIsPanelOpen(true);
  };

  // TOGGLE ACTIVE/INACTIVE
  const deactivateEmployee = async (emp) => {
    const newStatus = !emp.active;

    if (!window.confirm(`${newStatus ? "Activate" : "Deactivate"} ${emp.name}?`))
      return;

    try {
      const res = await fetch(
        `https://safetyapp-backend-xq88.onrender.com/api/employees/${emp.employee_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: emp.name,
            department: emp.department,
            job_title: emp.job_title,
            shift: emp.shift,
            leader_id: emp.leader_id,
            email: emp.email,
            site_admin: emp.site_admin,
            active: newStatus,
          }),
        }
      );

      if (!res.ok) {
        alert("Error updating employee status");
        return;
      }

      loadEmployees();
    } catch (err) {
      console.error("Toggle employee status error:", err);
    }
  };

  // EXPORT EMPLOYEES TO EXCEL
      const exportToExcel = async () => {
        try {
          const res = await fetch("https://safetyapp-backend-xq88.onrender.com/api/employees/export", {
            method: "GET",
          });

          if (!res.ok) {
            alert("Error exporting Excel file");
            return;
          }

          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);

          const a = document.createElement("a");
          a.href = url;
          a.download = "employees.xlsx";
          document.body.appendChild(a);
          a.click();

          a.remove();
          window.URL.revokeObjectURL(url);
        } catch (err) {
          console.error("Export error:", err);
          alert("Failed to export Excel file");
        }
      };

  // FILTER + SEARCHED EMPLOYEES
  const filteredEmployees = employees
    .filter((emp) => {
      if (filterStatus === "active") return emp.active === true;
      if (filterStatus === "inactive") return emp.active === false;
      return true; // "all"
    })
    .filter((emp) => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;

      return (
        (emp.employee_id || "").toLowerCase().includes(q) ||
        (emp.name || "").toLowerCase().includes(q) ||
        (emp.department || "").toLowerCase().includes(q) ||
        (emp.job_title || "").toLowerCase().includes(q) ||
        (emp.shift || "").toLowerCase().includes(q) ||
        (emp.leader_id || "").toLowerCase().includes(q) ||
        (emp.email || "").toLowerCase().includes(q) ||
        (emp.site_admin || "").toLowerCase().includes(q)
      );
    });

  // SORT EMPLOYEES
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const valueA = (a[sortConfig.key] || "").toString().toLowerCase();
    const valueB = (b[sortConfig.key] || "").toString().toLowerCase();

    if (valueA < valueB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valueA > valueB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction});
  }

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return "";
    return sortConfig.direction === "asc" ? " ▲" : " ▼";
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
          Employee Database
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
          Employee Records
        </h2>

        {/* CONTROL BAR */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          {/* LEFT SIDE: Add + Filters */}
          <div
            style={{ display: "flex", alignItems: "center", gap: "1rem" }}
          >
            {/* ADD EMPLOYEE BUTTON */}
            <button
              onClick={() => {
                setPanelMode("add");
                setFormData({
                  employee_id: "",
                  name: "",
                  department: "",
                  job_title: "",
                  shift: "",
                  leader_id: "",
                  email: "",
                  site_admin: "",
                });
                setIsPanelOpen(true);
              }}
              style={{
                padding: "0.6rem 1.2rem",
                backgroundColor: "#b30000",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              + Add Employee
            </button>

            {/* FILTER CONTROLS */}
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => setFilterStatus("all")}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor:
                    filterStatus === "all" ? "#b30000" : "#ccc",
                  color: filterStatus === "all" ? "white" : "black",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                All
              </button>

              <button
                onClick={() => setFilterStatus("active")}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor:
                    filterStatus === "active" ? "#b30000" : "#ccc",
                  color: filterStatus === "active" ? "white" : "black",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Active
              </button>

              <button
                onClick={() => setFilterStatus("inactive")}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor:
                    filterStatus === "inactive" ? "#b30000" : "#ccc",
                  color: filterStatus === "inactive" ? "white" : "black",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Inactive
              </button>
            </div>
          </div>

          {/* RIGHT SIDE: SEARCH BAR */}
          <button
            onClick={exportToExcel}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#0077cc",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              marginRight: "1rem",
            }}
          >
            Export to Excel
          </button>


          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: "0.5rem 0.75rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "1rem",
              width: "250px",
            }}
          />
        </div>

        {/* TABLE */}
        {loading ? (
          <p>Loading employees...</p>
        ) : (
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
              <tr style={{ backgroundColor: "#eee",
                position: "sticky",
                top: 0,
                zIndex: 3,
                borderBottom: "2px solid #0a0a0a",
               }}>
                <th style={thStyle} onClick={() => requestSort("employee_id")}>
                  Employee ID{getSortIndicator("employee_id")}
                </th>

                <th style={thStyle} onClick={() => requestSort("name")}>
                  Name{getSortIndicator("name")}
                </th>

                <th style={thStyle} onClick={() => requestSort("department")}>
                  Department{getSortIndicator("department")}
                </th>

                <th style={thStyle} onClick={() => requestSort("job_title")}>
                  Job Title{getSortIndicator("job_title")}
                </th>

                <th style={thStyle} onClick={() => requestSort("shift")}>
                  Shift{getSortIndicator("shift")}
                </th>

                <th style={thStyle} onClick={() => requestSort("leader_id")}>
                  Leader ID{getSortIndicator("leader_id")}
                </th>

                <th style={thStyle} onClick={() => requestSort("site_admin")}>
                  Site Admin{getSortIndicator("site_admin")}
                </th>

                <th style={thStyle} onClick={() => requestSort("email")}>
                  Email/Phone{getSortIndicator("email")}
                </th>
                <th style={{ ...thStyle, width: "220px" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {sortedEmployees.map((emp) => (
                <tr key={`${emp.employee_id}-${emp.name}`}>
                  <td style={tdStyle}>{emp.employee_id}</td>
                  <td style={tdStyle}>{emp.name}</td>
                  <td style={tdStyle}>{emp.department}</td>
                  <td style={tdStyle}>{emp.job_title}</td>
                  <td style={tdStyle}>{emp.shift}</td>
                  <td style={tdStyle}>{emp.leader_id}</td>
                  <td style={tdStyle}>{emp.site_admin}</td>
                  <td style={tdStyle}>{emp.email}</td>

                  {/* ACTIONS COLUMN */}
                  <td style={tdStyle}>
                    <button
                      onClick={() => openEditPanel(emp)}
                      style={{
                        padding: "0.4rem 0.8rem",
                        backgroundColor: "#b30000",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        marginRight: "0.5rem",
                      }}
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deactivateEmployee(emp)}
                      style={{
                        padding: "0.4rem 0.8rem",
                        backgroundColor: emp.active
                          ? "#28a745"
                          : "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      {emp.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* SLIDE-IN PANEL */}
      <SlideInPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        title={panelMode === "add" ? "Add Employee" : "Edit Employee"}
      >
        <div>
          <label>Employee ID</label>
          <input
            value={formData.employee_id}
            onChange={(e) => updateField("employee_id", e.target.value)}
            style={inputStyle}
            disabled={panelMode === "edit"}
          />

          <label>Name</label>
          <input
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
            style={inputStyle}
          />

          <label>Department</label>
          <input
            value={formData.department}
            onChange={(e) => updateField("department", e.target.value)}
            style={inputStyle}
          />

          <label>Job Title</label>
          <input
            value={formData.job_title}
            onChange={(e) => updateField("job_title", e.target.value)}
            style={inputStyle}
          />

          <label>Shift</label>
          <input
            value={formData.shift}
            onChange={(e) => updateField("shift", e.target.value)}
            style={inputStyle}
          />

          <label>Leader ID</label>
          <input
            value={formData.leader_id}
            onChange={(e) => updateField("leader_id", e.target.value)}
            style={inputStyle}
          />

          <label>Email</label>
          <input
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
            style={inputStyle}
          />

          <label>Site Admin (yes/no)</label>
          <input
            value={formData.site_admin}
            onChange={(e) => updateField("site_admin", e.target.value)}
            style={inputStyle}
          />

          <button
            onClick={
              panelMode === "add" ? submitAddEmployee : submitEditEmployee
            }
            style={{
              marginTop: "1rem",
              padding: "0.7rem 1.2rem",
              backgroundColor: "#b30000",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: "pointer",
              width: "100%",
            }}
          >
            {panelMode === "add" ? "Save Employee" : "Save Changes"}
          </button>
        </div>
      </SlideInPanel>
    </div>
  );
}

/* STYLES */
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

const tdStyle = {
  padding: "0.75rem",
  borderBottom: "1px solid #ddd",
};

const inputStyle = {
  width: "100%",
  padding: "0.6rem",
  marginBottom: "1rem",
  borderRadius: "6px",
  border: "1px solid #ccc",
};