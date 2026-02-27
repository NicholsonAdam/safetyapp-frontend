import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminNearMiss() {
  const navigate = useNavigate();
  const API_URL = `${import.meta.env.VITE_API_URL}/api/nearmiss`;

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editableRecord, setEditableRecord] = useState(null);

  const [photoViewer, setPhotoViewer] = useState(null);

  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [createForm, setCreateForm] = useState({
    date: "",
    department: "",
    location: "",
    shift: "",
    leader_id: "",
    additional_team: "",
    report_types: [],
    description: "",
    actions_taken: "",
    suggestion: "",
    followup: "no",
    status: "Open",
    photo: null,
  });

  // Excel-style column filters (Page A style, Page B fields)
  const [columnFilters, setColumnFilters] = useState({
    department: [],
    status: [],
    leader_id: [],
    shift: [],
  });
  const [openFilter, setOpenFilter] = useState(null);

  const toggleFilter = (field) => {
    setOpenFilter((prev) => (prev === field ? null : field));
  };

  const updateColumnFilter = (field, value) => {
    setColumnFilters((prev) => {
      const current = prev[field] || [];
      const exists = current.includes(value);
      return {
        ...prev,
        [field]: exists
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
  };

  const clearColumnFilter = (field) => {
    setColumnFilters((prev) => ({
      ...prev,
      [field]: [],
    }));
  };

  const clearAllFilters = () => {
    setColumnFilters({
      department: [],
      status: [],
      leader_id: [],
      shift: [],
    });
    setOpenFilter(null);
  };

  // Close filter dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenFilter(null);
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // Fetch all records
  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/all`);
      setRecords(res.data);
    } catch (err) {
      console.error("Fetch Near Miss Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Date formatter (match Page A behavior)
  const formatDate = (value) => {
    if (!value) return "";
    const d = new Date(value);
    return d.toLocaleDateString("en-US");
  };

  // Sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortArrow = (field) => {
    if (sortField !== field) return "";
    return sortDirection === "asc" ? " ▲" : " ▼";
  };

  // Helper: get unique values for a column (Page A style)
  const getUniqueValues = (field) => {
    const set = new Set();
    records.forEach((r) => {
      if (r[field]) set.add(r[field]);
    });
    return Array.from(set).sort();
  };

  // Apply column filters (Page A style)
  const applyColumnFilters = (record) => {
    for (const field in columnFilters) {
      const selected = columnFilters[field];
      if (selected && selected.length > 0) {
        const value = record[field] ?? "";
        if (!selected.includes(value)) {
          return false;
        }
      }
    }
    return true;
  };

  // Filter + Search + Sort pipeline (aligned with Page A)
  const filteredSortedRecords = records
    .filter((r) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const haystack = [
        r.id,
        r.department,
        r.location,
        r.date,
        r.shift,
        r.leader_id,
        r.report_types?.join(", "),
        r.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    })
    .filter(applyColumnFilters)
    .sort((a, b) => {
      const dir = sortDirection === "asc" ? 1 : -1;
      const va = a[sortField];
      const vb = b[sortField];

      if (sortField === "date") {
        const da = new Date(va).getTime();
        const db = new Date(vb).getTime();
        return (da - db) * dir;
      }

      const sa = (va || "").toString().toLowerCase();
      const sb = (vb || "").toString().toLowerCase();
      if (sa < sb) return -1 * dir;
      if (sa > sb) return 1 * dir;
      return 0;
    });

  // Build payload for update/create to match controller expectations
  const buildUpdatePayload = (record) => {
    return {
      department: record.department || "",
      location: record.location || "",
      date: record.date || "",
      additionalTeam: record.additional_team || "",
      reportTypes: JSON.stringify(record.report_types || []),
      description: record.description || "",
      actionsTaken: record.actions_taken || "",
      suggestion: record.suggestion || "",
      followup: record.followup || "no",
      status: record.status || "Open",
      shift: record.shift || "",
      leaderId: record.leader_id || "",
    };
  };

  // Status update
  const updateStatus = async (id, newStatus) => {
    try {
      const payload = buildUpdatePayload({
        ...editableRecord,
        status: newStatus,
      });
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      await axios.put(`${API_URL}/update/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await fetchRecords();
      setSelectedRecord((prev) => (prev ? { ...prev, status: newStatus } : prev));
      setEditableRecord((prev) =>
        prev ? { ...prev, status: newStatus } : prev
      );
    } catch (err) {
      console.error("Status Update Error:", err);
    }
  };

  // Save changes from detail panel
  const handleSaveChanges = async () => {
    if (!editableRecord) return;
    try {
      const payload = buildUpdatePayload(editableRecord);
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      await axios.put(`${API_URL}/update/${editableRecord.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await fetchRecords();
      const updated = records.find((r) => r.id === editableRecord.id);
      setSelectedRecord(updated || editableRecord);
      setEditableRecord(updated || editableRecord);
    } catch (err) {
      console.error("Save Changes Error:", err);
    }
  };

  // Delete
  const deleteRecord = async (id) => {
    if (!confirm("Delete this Near Miss report?")) return;
    try {
      await axios.delete(`${API_URL}/delete/${id}`);
      await fetchRecords();
      setSelectedRecord(null);
      setEditableRecord(null);
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  // Handle row click
  const handleRowClick = (r) => {
    setSelectedRecord(r);
    setEditableRecord({
      ...r,
      report_types: r.report_types || [],
    });
  };

  // Create form handlers
  const handleCreateChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setCreateForm((prev) => ({ ...prev, photo: files[0] || null }));
    } else {
      setCreateForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("department", createForm.department);
      formData.append("location", createForm.location);
      formData.append("date", createForm.date);
      formData.append("additionalTeam", createForm.additional_team || "");
      formData.append(
        "reportTypes",
        JSON.stringify(createForm.report_types || [])
      );
      formData.append("description", createForm.description || "");
      formData.append("actionsTaken", createForm.actions_taken || "");
      formData.append("suggestion", createForm.suggestion || "");
      formData.append("followup", createForm.followup || "no");
      formData.append("status", createForm.status || "Open");
      formData.append("shift", createForm.shift || "");
      formData.append("leaderId", createForm.leader_id || "");
      if (createForm.photo) {
        formData.append("photo", createForm.photo);
      }

      await axios.post(`${API_URL}/create`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await fetchRecords();
      setShowCreatePanel(false);
      setCreateForm({
        date: "",
        department: "",
        location: "",
        shift: "",
        leader_id: "",
        additional_team: "",
        report_types: [],
        description: "",
        actions_taken: "",
        suggestion: "",
        followup: "no",
        status: "Open",
        photo: null,
      });
    } catch (err) {
      console.error("Create Near Miss Error:", err);
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
        position: "relative",
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
          Near Miss Records
        </h1>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={() => setShowCreatePanel(true)}
            style={{
              padding: "0.7rem 1.4rem",
              backgroundColor: "#0066cc",
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
            + New Near Miss
          </button>

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
          Near Miss Reports
        </h2>

        {/* CONTROL BAR */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
            gap: "1rem",
          }}
        >
          {/* LEFT SIDE: SEARCH */}
          <input
            type="text"
            placeholder="Search by ID, department, location, leader..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "0.5rem 0.75rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "1rem",
              width: "280px",
            }}
          />

          {/* RIGHT SIDE: FILTER BUTTONS + CLEAR */}
          <div
            style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Department filter */}
            <div style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => toggleFilter("department")}
                style={{
                  padding: "0.4rem 0.75rem",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  backgroundColor:
                    columnFilters.department.length > 0 ? "#e6f0ff" : "white",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                Department{" "}
                {columnFilters.department.length > 0
                  ? `(${columnFilters.department.length})`
                  : ""}{" "}
                ⏷
              </button>

              {openFilter === "department" && (
                <div
                  style={{
                    position: "absolute",
                    top: "110%",
                    left: 0,
                    background: "white",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    padding: "6px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                    zIndex: 10,
                    maxHeight: "220px",
                    overflowY: "auto",
                    minWidth: "180px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "4px",
                      fontSize: "0.8rem",
                    }}
                  >
                    <strong>Filter Department</strong>
                    <button
                      type="button"
                      onClick={() => clearColumnFilter("department")}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: "#0066cc",
                        cursor: "pointer",
                        fontSize: "0.75rem",
                      }}
                    >
                      Clear
                    </button>
                  </div>

                  {getUniqueValues("department").map((val) => (
                    <label
                      key={val}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "0.85rem",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={columnFilters.department.includes(val)}
                        onChange={() => updateColumnFilter("department", val)}
                      />
                      <span>{val}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Status filter */}
            <div style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => toggleFilter("status")}
                style={{
                  padding: "0.4rem 0.75rem",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  backgroundColor:
                    columnFilters.status.length > 0 ? "#e6f0ff" : "white",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                Status{" "}
                {columnFilters.status.length > 0
                  ? `(${columnFilters.status.length})`
                  : ""}{" "}
                ⏷
              </button>

              {openFilter === "status" && (
                <div
                  style={{
                    position: "absolute",
                    top: "110%",
                    left: 0,
                    background: "white",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    padding: "6px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                    zIndex: 10,
                    maxHeight: "220px",
                    overflowY: "auto",
                    minWidth: "160px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "4px",
                      fontSize: "0.8rem",
                    }}
                  >
                    <strong>Filter Status</strong>
                    <button
                      type="button"
                      onClick={() => clearColumnFilter("status")}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: "#0066cc",
                        cursor: "pointer",
                        fontSize: "0.75rem",
                      }}
                    >
                      Clear
                    </button>
                  </div>

                  {getUniqueValues("status").map((val) => (
                    <label
                      key={val}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "0.85rem",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={columnFilters.status.includes(val)}
                        onChange={() => updateColumnFilter("status", val)}
                      />
                      <span>{val}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Leader ID filter */}
            <div style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => toggleFilter("leader_id")}
                style={{
                  padding: "0.4rem 0.75rem",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  backgroundColor:
                    columnFilters.leader_id.length > 0 ? "#e6f0ff" : "white",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                Leader ID{" "}
                {columnFilters.leader_id.length > 0
                  ? `(${columnFilters.leader_id.length})`
                  : ""}{" "}
                ⏷
              </button>

              {openFilter === "leader_id" && (
                <div
                  style={{
                    position: "absolute",
                    top: "110%",
                    left: 0,
                    background: "white",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    padding: "6px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                    zIndex: 10,
                    maxHeight: "220px",
                    overflowY: "auto",
                    minWidth: "200px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "4px",
                      fontSize: "0.8rem",
                    }}
                  >
                    <strong>Filter Leader ID</strong>
                    <button
                      type="button"
                      onClick={() => clearColumnFilter("leader_id")}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: "#0066cc",
                        cursor: "pointer",
                        fontSize: "0.75rem",
                      }}
                    >
                      Clear
                    </button>
                  </div>

                  {getUniqueValues("leader_id").map((val) => (
                    <label
                      key={val}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "0.85rem",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={columnFilters.leader_id.includes(val)}
                        onChange={() => updateColumnFilter("leader_id", val)}
                      />
                      <span>{val}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Shift filter */}
            <div style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => toggleFilter("shift")}
                style={{
                  padding: "0.4rem 0.75rem",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  backgroundColor:
                    columnFilters.shift.length > 0 ? "#e6f0ff" : "white",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                Shift{" "}
                {columnFilters.shift.length > 0
                  ? `(${columnFilters.shift.length})`
                  : ""}{" "}
                ⏷
              </button>

              {openFilter === "shift" && (
                <div
                  style={{
                    position: "absolute",
                    top: "110%",
                    left: 0,
                    background: "white",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    padding: "6px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                    zIndex: 10,
                    maxHeight: "220px",
                    overflowY: "auto",
                    minWidth: "160px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "4px",
                      fontSize: "0.8rem",
                    }}
                  >
                    <strong>Filter Shift</strong>
                    <button
                      type="button"
                      onClick={() => clearColumnFilter("shift")}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: "#0066cc",
                        cursor: "pointer",
                        fontSize: "0.75rem",
                      }}
                    >
                      Clear
                    </button>
                  </div>

                  {getUniqueValues("shift").map((val) => (
                    <label
                      key={val}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "0.85rem",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={columnFilters.shift.includes(val)}
                        onChange={() => updateColumnFilter("shift", val)}
                      />
                      <span>{val}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* CLEAR FILTERS */}
            <button
              type="button"
              onClick={clearAllFilters}
              style={{
                padding: "0.45rem 0.9rem",
                borderRadius: "6px",
                border: "1px solid #ccc",
                backgroundColor: "#f5f5f5",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* TABLE AREA */}
        {loading ? (
          <p style={{ color: "#666" }}>Loading records...</p>
        ) : (
          <div style={{ maxHeight: "500px", overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead
                style={{ position: "sticky", top: 0, background: "#eee" }}
              >
                <tr>
                  <th
                    style={{
                      padding: "8px",
                      borderBottom: "2px solid #ccc",
                      cursor: "pointer",
                    }}
                    onClick={() => handleSort("id")}
                  >
                    ID{getSortArrow("id")}
                  </th>

                  <th
                    style={{ padding: "8px", borderBottom: "2px solid #ccc", cursor: "pointer" }}
                    onClick={() => handleSort("observer_id")}
                  >
                    Submitter ID{getSortArrow("observer_id")}
                  </th>

                  <th
                    style={{ padding: "8px", borderBottom: "2px solid #ccc", cursor: "pointer" }}
                    onClick={() => handleSort("observer_name")}
                  >
                    Submitter Name{getSortArrow("observer_name")}
                  </th>

                  <th
                    style={{
                      padding: "8px",
                      borderBottom: "2px solid #ccc",
                      cursor: "pointer",
                    }}
                    onClick={() => handleSort("date")}
                  >
                    Date{getSortArrow("date")}
                  </th>

                  <th
                    style={{
                      padding: "8px",
                      borderBottom: "2px solid #ccc",
                      cursor: "pointer",
                    }}
                    onClick={() => handleSort("department")}
                  >
                    Department{getSortArrow("department")}
                  </th>

                  <th
                    style={{
                      padding: "8px",
                      borderBottom: "2px solid #ccc",
                      cursor: "pointer",
                    }}
                    onClick={() => handleSort("location")}
                  >
                    Location{getSortArrow("location")}
                  </th>

                  <th
                    style={{
                      padding: "8px",
                      borderBottom: "2px solid #ccc",
                      cursor: "pointer",
                    }}
                    onClick={() => handleSort("shift")}
                  >
                    Shift{getSortArrow("shift")}
                  </th>

                  <th
                    style={{
                      padding: "8px",
                      borderBottom: "2px solid #ccc",
                      cursor: "pointer",
                    }}
                    onClick={() => handleSort("leader_id")}
                  >
                    Leader ID{getSortArrow("leader_id")}
                  </th>

                  <th style={{ padding: "8px", borderBottom: "2px solid #ccc" }}>
                    Report Types
                  </th>

                  <th
                    style={{
                      padding: "8px",
                      borderBottom: "2px solid #ccc",
                      cursor: "pointer",
                    }}
                    onClick={() => handleSort("status")}
                  >
                    Status{getSortArrow("status")}
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredSortedRecords.map((r) => (
                  <tr
                    key={r.id}
                    style={{
                      borderBottom: "1px solid #ddd",
                      cursor: "pointer",
                      backgroundColor:
                        selectedRecord && selectedRecord.id === r.id
                          ? "#f5f5f5"
                          : "transparent",
                    }}
                    onClick={() => handleRowClick(r)}
                  >
                    <td style={{ padding: "8px" }}>{r.id}</td>
                    <td style={{ padding: "8px" }}>{r.observer_id}</td>
                    <td style={{ padding: "8px" }}>{r.observer_name}</td>
                    <td style={{ padding: "8px" }}>
                      {r.date ? formatDate(r.date) : ""}
                    </td>
                    <td style={{ padding: "8px" }}>{r.department}</td>
                    <td style={{ padding: "8px" }}>{r.location}</td>
                    <td style={{ padding: "8px" }}>{r.shift}</td>
                    <td style={{ padding: "8px" }}>{r.leader_id}</td>
                    <td style={{ padding: "8px" }}>
                      {r.report_types?.join(", ")}
                    </td>
                    <td style={{ padding: "8px" }}>{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL PANEL */}
      {editableRecord && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            height: "100vh",
            width: "420px",
            backgroundColor: "white",
            boxShadow: "-4px 0 12px rgba(0,0,0,0.2)",
            padding: "1.5rem",
            boxSizing: "border-box",
            zIndex: 1000,
            overflowY: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h2 style={{ margin: 0 }}>Report #{editableRecord.id}</h2>
            <button
              onClick={() => {
                setSelectedRecord(null);
                setEditableRecord(null);
              }}
              style={{
                border: "none",
                background: "transparent",
                fontSize: "1.4rem",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: "grid", rowGap: "0.5rem" }}>
            <label>
              <strong>Date:</strong>
              <input
                type="date"
                value={
                  editableRecord.date ? editableRecord.date.slice(0, 10) : ""
                }
                onChange={(e) =>
                  setEditableRecord((prev) => ({
                    ...prev,
                    date: e.target.value,
                  }))
                }
                style={{
                  width: "100%",
                  padding: "0.3rem",
                  marginTop: "0.2rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
            </label>

            <label>
              <strong>Department:</strong>
              <input
                type="text"
                value={editableRecord.department || ""}
                onChange={(e) =>
                  setEditableRecord((prev) => ({
                    ...prev,
                    department: e.target.value,
                  }))
                }
                style={{
                  width: "100%",
                  padding: "0.3rem",
                  marginTop: "0.2rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
            </label>

            <label>
              <strong>Location:</strong>
              <input
                type="text"
                value={editableRecord.location || ""}
                onChange={(e) =>
                  setEditableRecord((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
                style={{
                  width: "100%",
                  padding: "0.3rem",
                  marginTop: "0.2rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
            </label>

            <label>
              <strong>Shift:</strong>
              <input
                type="text"
                value={editableRecord.shift || ""}
                onChange={(e) =>
                  setEditableRecord((prev) => ({
                    ...prev,
                    shift: e.target.value,
                  }))
                }
                style={{
                  width: "100%",
                  padding: "0.3rem",
                  marginTop: "0.2rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
            </label>

            <label>
              <strong>Leader ID:</strong>
              <input
                type="text"
                value={editableRecord.leader_id || ""}
                onChange={(e) =>
                  setEditableRecord((prev) => ({
                    ...prev,
                    leader_id: e.target.value,
                  }))
                }
                style={{
                  width: "100%",
                  padding: "0.3rem",
                  marginTop: "0.2rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
            </label>

            <label>
              <strong>Additional Team:</strong>
              <input
                type="text"
                value={editableRecord.additional_team || ""}
                onChange={(e) =>
                  setEditableRecord((prev) => ({
                    ...prev,
                    additional_team: e.target.value,
                  }))
                }
                style={{
                  width: "100%",
                  padding: "0.3rem",
                  marginTop: "0.2rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
            </label>

            <label>
              <strong>Report Types:</strong>
              <textarea
                value={(editableRecord.report_types || []).join(", ")}
                onChange={(e) =>
                  setEditableRecord((prev) => ({
                    ...prev,
                    report_types: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  }))
                }
                style={{
                  width: "100%",
                  padding: "0.3rem",
                  marginTop: "0.2rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  minHeight: "50px",
                }}
              />
            </label>

            <label>
              <strong>Description:</strong>
              <textarea
                value={editableRecord.description || ""}
                onChange={(e) =>
                  setEditableRecord((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                style={{
                  width: "100%",
                  padding: "0.3rem",
                  marginTop: "0.2rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  minHeight: "60px",
                }}
              />
            </label>

            <label>
              <strong>Actions Taken:</strong>
              <textarea
                value={editableRecord.actions_taken || ""}
                onChange={(e) =>
                  setEditableRecord((prev) => ({
                    ...prev,
                    actions_taken: e.target.value,
                  }))
                }
                style={{
                  width: "100%",
                  padding: "0.3rem",
                  marginTop: "0.2rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  minHeight: "60px",
                }}
              />
            </label>

            <label>
              <strong>Suggestion:</strong>
              <textarea
                value={editableRecord.suggestion || ""}
                onChange={(e) =>
                  setEditableRecord((prev) => ({
                    ...prev,
                    suggestion: e.target.value,
                  }))
                }
                style={{
                  width: "100%",
                  padding: "0.3rem",
                  marginTop: "0.2rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  minHeight: "60px",
                }}
              />
            </label>

            <label>
              <strong>Follow-up Requested:</strong>
              <select
                value={editableRecord.followup || "no"}
                onChange={(e) =>
                  setEditableRecord((prev) => ({
                    ...prev,
                    followup: e.target.value,
                  }))
                }
                style={{
                  width: "100%",
                  padding: "0.3rem",
                  marginTop: "0.2rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              >
                <option value="no">no</option>
                <option value="yes">yes</option>
              </select>
            </label>

            <label>
              <strong>Status:</strong>
              <select
                value={editableRecord.status || "Open"}
                onChange={(e) => updateStatus(editableRecord.id, e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.3rem",
                  marginTop: "0.2rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              >
                <option value="Open">Open</option>
                <option value="In Review">In Review</option>
                <option value="Closed">Closed</option>
              </select>
            </label>
          </div>

          {editableRecord.photo_path && (
            <div style={{ marginTop: "1rem" }}>
              <strong>Photo:</strong>
              <div style={{ marginTop: "0.5rem" }}>
                <img
                  src={`${import.meta.env.VITE_API_URL}/uploads/${editableRecord.photo_path}`}
                  alt="Near Miss"
                  style={{
                    maxWidth: "100%",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                  onClick={() => setPhotoViewer(editableRecord.photo_path)}
                />
              </div>
            </div>
          )}

          <hr style={{ margin: "1rem 0" }} />

          <button
            onClick={handleSaveChanges}
            style={{
              marginTop: "0.5rem",
              padding: "0.6rem 1rem",
              backgroundColor: "#0066cc",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              marginRight: "0.5rem",
            }}
          >
            Save Changes
          </button>
        </div>
      )}

      {/* CREATE PANEL */}
      {showCreatePanel && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            height: "100vh",
            width: "420px",
            backgroundColor: "white",
            boxShadow: "-4px 0 12px rgba(0,0,0,0.2)",
            padding: "1.5rem",
            boxSizing: "border-box",
            zIndex: 1100,
            overflowY: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h2 style={{ margin: 0 }}>New Near Miss</h2>
            <button
              onClick={() => setShowCreatePanel(false)}
              style={{
                border: "none",
                background: "transparent",
                fontSize: "1.4rem",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleCreateSubmit}>
            <div>
              <label>
                <strong>Date</strong>
              </label>
              <input
                type="date"
                name="date"
                value={createForm.date}
                onChange={handleCreateChange}
                style={{
                  width: "100%",
                  padding: "0.4rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  marginTop: "0.2rem",
                }}
              />
            </div>

            <div style={{ marginTop: "0.6rem" }}>
              <label>
                <strong>Department</strong>
              </label>
              <input
                type="text"
                name="department"
                value={createForm.department}
                onChange={handleCreateChange}
                style={{
                  width: "100%",
                  padding: "0.4rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  marginTop: "0.2rem",
                }}
              />
            </div>

            <div style={{ marginTop: "0.6rem" }}>
              <label>
                <strong>Location</strong>
              </label>
              <input
                type="text"
                name="location"
                value={createForm.location}
                onChange={handleCreateChange}
                style={{
                  width: "100%",
                  padding: "0.4rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  marginTop: "0.2rem",
                }}
              />
            </div>

            <div style={{ marginTop: "0.6rem" }}>
              <label>
                <strong>Shift</strong>
              </label>
              <input
                type="text"
                name="shift"
                value={createForm.shift}
                onChange={handleCreateChange}
                style={{
                  width: "100%",
                  padding: "0.4rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  marginTop: "0.2rem",
                }}
              />
            </div>

            <div style={{ marginTop: "0.6rem" }}>
              <label>
                <strong>Leader ID</strong>
              </label>
              <input
                type="text"
                name="leader_id"
                value={createForm.leader_id}
                onChange={handleCreateChange}
                style={{
                  width: "100%",
                  padding: "0.4rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  marginTop: "0.2rem",
                }}
              />
            </div>

            <div style={{ marginTop: "0.6rem" }}>
              <label>
                <strong>Additional Team</strong>
              </label>
              <input
                type="text"
                name="additional_team"
                value={createForm.additional_team}
                onChange={handleCreateChange}
                style={{
                  width: "100%",
                  padding: "0.4rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  marginTop: "0.2rem",
                }}
              />
            </div>

            <div style={{ marginTop: "0.6rem" }}>
              <label>
                <strong>Report Types (comma separated)</strong>
              </label>
              <input
                type="text"
                value={createForm.report_types.join(", ")}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    report_types: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  }))
                }
                style={{
                  width: "100%",
                  padding: "0.4rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  marginTop: "0.2rem",
                }}
              />
            </div>

            <div style={{ marginTop: "0.6rem" }}>
              <label>
                <strong>Description</strong>
              </label>
              <textarea
                name="description"
                value={createForm.description}
                onChange={handleCreateChange}
                style={{
                  width: "100%",
                  padding: "0.4rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  marginTop: "0.2rem",
                  minHeight: "60px",
                }}
              />
            </div>

            <div style={{ marginTop: "0.6rem" }}>
              <label>
                <strong>Actions Taken</strong>
              </label>
              <textarea
                name="actions_taken"
                value={createForm.actions_taken}
                onChange={handleCreateChange}
                style={{
                  width: "100%",
                  padding: "0.4rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  marginTop: "0.2rem",
                  minHeight: "60px",
                }}
              />
            </div>

            <div style={{ marginTop: "0.6rem" }}>
              <label>
                <strong>Suggestion</strong>
              </label>
              <textarea
                name="suggestion"
                value={createForm.suggestion}
                onChange={handleCreateChange}
                style={{
                  width: "100%",
                  padding: "0.4rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  marginTop: "0.2rem",
                  minHeight: "60px",
                }}
              />
            </div>

            <div style={{ marginTop: "0.6rem" }}>
              <label>
                <strong>Follow-up Requested</strong>
              </label>
              <select
                name="followup"
                value={createForm.followup}
                onChange={handleCreateChange}
                style={{
                  width: "100%",
                  padding: "0.4rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  marginTop: "0.2rem",
                }}
              >
                <option value="no">no</option>
                <option value="yes">yes</option>
              </select>
            </div>

            <div style={{ marginTop: "0.6rem" }}>
              <label>
                <strong>Status</strong>
              </label>
              <select
                name="status"
                value={createForm.status}
                onChange={handleCreateChange}
                style={{
                  width: "100%",
                  padding: "0.4rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  marginTop: "0.2rem",
                }}
              >
                <option value="Open">Open</option>
                <option value="In Review">In Review</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div style={{ marginTop: "0.6rem" }}>
              <label>
                <strong>Upload Photo</strong>
              </label>
              <input
                type="file"
                accept="image/*"
                name="photo"
                onChange={handleCreateChange}
                style={{ marginTop: "0.3rem" }}
              />
            </div>

            <button
              type="submit"
              style={{
                marginTop: "1rem",
                padding: "0.7rem 1.4rem",
                backgroundColor: "#0066cc",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "1rem",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Save Near Miss
            </button>
          </form>
        </div>
      )}

      {/* PHOTO VIEWER */}
      {photoViewer && (
        <div
          onClick={() => setPhotoViewer(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.85)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
            cursor: "zoom-out",
          }}
        >
          <img
            src={`${import.meta.env.VITE_API_URL}/uploads/${photoViewer}`}
            alt="Full View"
            style={{
              width: "80vw",
              height: "auto",
              maxHeight: "90vh",
              objectFit: "contain",
              borderRadius: "8px",
              boxShadow: "0 0 20px rgba(0,0,0,0.5)",
              cursor: "default",
            }}
            onClick={(e) => e.stopPropagation()}
          />

          <button
            onClick={() => setPhotoViewer(null)}
            style={{
              position: "fixed",
              top: "20px",
              right: "20px",
              background: "white",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              fontSize: "1.2rem",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}