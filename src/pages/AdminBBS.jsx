import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

export default function AdminBBS() {
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [photoViewer, setPhotoViewer] = useState(null);

  const [selectedRecord, setSelectedRecord] = useState(null);

  const [showCreate, setShowCreate] = useState(false);
    // Excel-style column filters
  const [columnFilters, setColumnFilters] = useState({
    status: [],
    leader_name: [],
    area: [],
    shift: [],
    followup_contact: [],
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
  const [createForm, setCreateForm] = useState({
    observer_id: "",
    observer_name: "",
    date: "",
    additional_observers: "",
    area: "",
    shift: "",
    job_area: "",
    job_task: "",
    ppe_safe: false,
    ppe_concern: false,
    ppe_comments: "",
    position_safe: false,
    position_concern: false,
    position_comments: "",
    tools_safe: false,
    tools_concern: false,
    tools_comments: "",
    conditions_safe: false,
    conditions_concern: false,
    conditions_comments: "",
    unsafe_about_activity: "",
    promote_safety: "",
    team_member_comments: "",
    observer_comments: "",
    photo: null,
  });

  // =========================
  // FETCH BBS RECORDS
  // =========================
  const fetchBBS = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/bbs`);
      const data = await res.json();
      setRecords(data);
    } catch (err) {
      console.error("Error fetching BBS records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBBS();
  }, []);

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

  // =========================
  // DATE FORMATTER
  // =========================
  const formatDate = (value) => {
    if (!value) return "";
    const d = new Date(value);
    return d.toLocaleDateString("en-US");
  };

  // =========================
  // SORT + FILTER
  // =========================
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

    // Apply column filters
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

  const filteredSortedRecords = records
    .filter((r) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const haystack = [
        r.id,
        r.date,
        r.observer_id,
        r.observer_name,
        r.area,
        r.shift,
        r.job_area,
        r.job_task,
        r.status,
        r.leader_name,
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

      if (typeof va === "number" && typeof vb === "number") {
        return (va - vb) * dir;
      }

      const sa = (va || "").toString().toLowerCase();
      const sb = (vb || "").toString().toLowerCase();
      if (sa < sb) return -1 * dir;
      if (sa > sb) return 1 * dir;
      return 0;
    });

  // =========================
  // STATUS UPDATE
  // =========================
  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/api/bbs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        console.error("Failed to update status");
        return;
      }
      await fetchBBS();
      setSelectedRecord((prev) =>
        prev && prev.id === id ? { ...prev, status: newStatus } : prev
      );
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // =========================
  // ADMIN CREATE FORM HANDLERS
  // =========================
  const handleCreateChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox") {
      setCreateForm((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "file") {
      setCreateForm((prev) => ({ ...prev, photo: files[0] || null }));
    } else {
      setCreateForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();

    // Admin-provided observer info
    fd.append("observer_id", createForm.observer_id);
    fd.append("observer_name", createForm.observer_name);

    // Additional observers: simple comma-separated string
    const additionalArray = (createForm.additional_observers || "")
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id !== "");
    fd.append("additional_observers", createForm.additional_observers);
    fd.append("additional_observers_array", JSON.stringify(additionalArray));

    // All other fields
    const keysToSend = [
      "date",
      "area",
      "shift",
      "job_area",
      "job_task",
      "ppe_safe",
      "ppe_concern",
      "ppe_comments",
      "position_safe",
      "position_concern",
      "position_comments",
      "tools_safe",
      "tools_concern",
      "tools_comments",
      "conditions_safe",
      "conditions_concern",
      "conditions_comments",
      "unsafe_about_activity",
      "promote_safety",
      "team_member_comments",
      "observer_comments",
    ];

    keysToSend.forEach((key) => {
      const val = createForm[key];
      if (typeof val === "boolean") {
        fd.append(key, val ? "true" : "false");
      } else {
        fd.append(key, val ?? "");
      }
    });

    if (createForm.photo) {
      fd.append("photo", createForm.photo);
    }

    try {
      const res = await fetch(`${API_BASE}/api/bbs`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        console.error("Error creating BBS record from admin");
        return;
      }
      await fetchBBS();
      setShowCreate(false);
      setCreateForm({
        observer_id: "",
        observer_name: "",
        date: "",
        additional_observers: "",
        area: "",
        shift: "",
        job_area: "",
        job_task: "",
        ppe_safe: false,
        ppe_concern: false,
        ppe_comments: "",
        position_safe: false,
        position_concern: false,
        position_comments: "",
        tools_safe: false,
        tools_concern: false,
        tools_comments: "",
        conditions_safe: false,
        conditions_concern: false,
        conditions_comments: "",
        unsafe_about_activity: "",
        promote_safety: "",
        team_member_comments: "",
        observer_comments: "",
        photo: null,
      });
    } catch (err) {
      console.error("Error creating BBS record:", err);
    }
  };

  // =========================
// EMAIL EXPORT (DETAIL PANEL)
// =========================
const handleExportEmail = () => {
  if (!selectedRecord) return;

  const check = (val) => (val ? "Safe" : "Concern");

  const subject = `BBS Observation #${selectedRecord.id}`;

  const body = `
============================================================
                    MUSKOGEE OBSERVATION CHECKLIST
============================================================

Date: ${formatDate(selectedRecord.date)}       Observer: ${selectedRecord.observer_name} (${selectedRecord.observer_id})
Department: ${selectedRecord.area}             Area: ${selectedRecord.job_area}

Shift: ${selectedRecord.shift}                 Additional Obs: ${selectedRecord.additional_observers || "—"}
Job Task: ${selectedRecord.job_task}           Status: ${selectedRecord.status}

------------------------------------------------------------
BEHAVIOR SUMMARY
------------------------------------------------------------

PPE – ${selectedRecord.ppe_safe ? "Safe" : selectedRecord.ppe_concern ? "Concern" : "—"} – ${selectedRecord.ppe_comments || "—"}

Proper Position – ${selectedRecord.position_safe ? "Safe" : selectedRecord.position_concern ? "Concern" : "—"} – ${selectedRecord.position_comments || "—"}

Tools & Equipment – ${selectedRecord.tools_safe ? "Safe" : selectedRecord.tools_concern ? "Concern" : "—"} – ${selectedRecord.tools_comments || "—"}

Unsafe Conditions – ${selectedRecord.conditions_safe ? "Safe" : selectedRecord.conditions_concern ? "Concern" : "—"} – ${selectedRecord.conditions_comments || "—"}

============================================================
              TEAMMATE ENGAGEMENT QUESTIONS
============================================================

What is/could be unsafe about the activity YOU are doing?
${selectedRecord.unsafe_about_activity || "—"}

------------------------------------------------------------

What have YOU done to promote safety today?
${selectedRecord.promote_safety || "—"}

------------------------------------------------------------

Team Member Comments:
${selectedRecord.team_member_comments || "—"}

------------------------------------------------------------

Observer Comments:
${selectedRecord.observer_comments || "—"}

------------------------------------------------------------

Photo:
${selectedRecord.photo_paths && selectedRecord.photo_paths.length > 0 
  ? `${API_BASE}/uploads/${selectedRecord.photo_paths[0]}`
  : "None attached"}

============================================================
  `.trim();

  window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

  // Helper: get unique values for a column
  const getUniqueValues = (field) => {
    const set = new Set();
    records.forEach((r) => {
      if (r[field]) set.add(r[field]);
    });
    return Array.from(set).sort();
  };

  // =========================
  // RENDER
  // =========================

  const clearAllFilters = () => {
  setColumnFilters({
    status: [],
    leader_name: [],
    area: [],
    shift: [],
  });
  setOpenFilter(null);
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
          BBS Observation Records
        </h1>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={() => setShowCreate(true)}
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
            + New Observation
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
          Observation Records
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
          placeholder="Search by ID, name, area, status..."
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
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}
              onClick={(e) => e.stopPropagation()}>
          {/* AREA FILTER */}
          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => toggleFilter("area")}
              style={{
                padding: "0.4rem 0.75rem",
                borderRadius: "6px",
                border: "1px solid #ccc",
                backgroundColor:
                  columnFilters.area.length > 0 ? "#e6f0ff" : "white",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              Area {columnFilters.area.length > 0 ? `(${columnFilters.area.length})` : ""} ⏷
            </button>

            {openFilter === "area" && (
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
                  <strong>Filter Area</strong>
                  <button
                    type="button"
                    onClick={() => clearColumnFilter("area")}
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

                {getUniqueValues("area").map((val) => (
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
                      checked={columnFilters.area.includes(val)}
                      onChange={() => updateColumnFilter("area", val)}
                    />
                    <span>{val}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* SHIFT FILTER */}
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
              Shift {columnFilters.shift.length > 0 ? `(${columnFilters.shift.length})` : ""} ⏷
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

          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => toggleFilter("followup_contact")}
              style={{
                padding: "0.4rem 0.75rem",
                borderRadius: "6px",
                border: "1px solid #ccc",
                backgroundColor:
                  columnFilters.followup_contact.length > 0 ? "#e6f0ff" : "white",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              Follow‑up{" "}
              {columnFilters.followup_contact.length > 0
                ? `(${columnFilters.followup_contact.length})`
                : ""}{" "}
              ⏷
            </button>

            {openFilter === "followup_contact" && (
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
                  <strong>Filter Follow‑up</strong>
                  <button
                    type="button"
                    onClick={() => clearColumnFilter("followup_contact")}
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

                {["yes", "no"].map((val) => (
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
                      checked={columnFilters.followup_contact.includes(val)}
                      onChange={() => updateColumnFilter("followup_contact", val)}
                    />
                    <span>{val === "yes" ? "Yes" : "No"}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* LEADER FILTER */}
          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => toggleFilter("leader_name")}
              style={{
                padding: "0.4rem 0.75rem",
                borderRadius: "6px",
                border: "1px solid #ccc",
                backgroundColor:
                  columnFilters.leader_name.length > 0 ? "#e6f0ff" : "white",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              Leader {columnFilters.leader_name.length > 0 ? `(${columnFilters.leader_name.length})` : ""} ⏷
            </button>

            {openFilter === "leader_name" && (
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
                  <strong>Filter Leader</strong>
                  <button
                    type="button"
                    onClick={() => clearColumnFilter("leader_name")}
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

                {getUniqueValues("leader_name").map((val) => (
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
                      checked={columnFilters.leader_name.includes(val)}
                      onChange={() => updateColumnFilter("leader_name", val)}
                    />
                    <span>{val}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* STATUS FILTER */}
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
              Status {columnFilters.status.length > 0 ? `(${columnFilters.status.length})` : ""} ⏷
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
              <thead style={{ position: "sticky", top: 0, background: "#eee" }}>
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
                    onClick={() => handleSort("observer_name")}
                  >
                    Observer{getSortArrow("observer_name")}
                  </th>
                  <th
                    style={{
                      padding: "8px",
                      borderBottom: "2px solid #ccc",
                      cursor: "pointer",
                    }}
                    onClick={() => handleSort("area")}
                  >
                    Area{getSortArrow("area")}
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
                    onClick={() => handleSort("leader_name")}
                  >
                    Leader{getSortArrow("leader_name")}
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

                  <th
                    style={{
                      padding: "8px",
                      borderBottom: "2px solid #ccc",
                      cursor: "pointer",
                    }}
                    onClick={() => handleSort("followup_contact")}
                  >
                    Follow‑up{getSortArrow("followup_contact")}
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
                    onClick={() => setSelectedRecord(r)}
                  >
                    <td style={{ padding: "8px" }}>{r.id}</td>
                    <td style={{ padding: "8px" }}>{formatDate(r.date)}</td>
                    <td style={{ padding: "8px" }}>{r.observer_name}</td>
                    <td style={{ padding: "8px" }}>{r.area}</td>
                    <td style={{ padding: "8px" }}>{r.shift}</td>
                    <td style={{ padding: "8px" }}>{r.leader_name}</td>
                    <td style={{ padding: "8px" }}>{r.status}</td>
                    <td style={{ padding: "8px" }}>{r.followup_contact === "yes" ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL PANEL */}
      {selectedRecord && (
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
            <h2 style={{ margin: 0 }}>Observation #{selectedRecord.id}</h2>
            <button
              onClick={() => setSelectedRecord(null)}
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

          <p>
            <strong>Date:</strong> {formatDate(selectedRecord.date)}
          </p>
          <p>
            <strong>Observer:</strong> {selectedRecord.observer_name} (
            {selectedRecord.observer_id})
          </p>
          <p>
            <strong>Leader:</strong> {selectedRecord.leader_name || "—"}
          </p>
          <p>
            <strong>Area:</strong> {selectedRecord.area}
          </p>
          <p>
            <strong>Shift:</strong> {selectedRecord.shift}
          </p>
          <p>
            <strong>Job Area:</strong> {selectedRecord.job_area}
          </p>
          <p>
            <strong>Job Task:</strong> {selectedRecord.job_task}
          </p>

          <hr style={{ margin: "1rem 0" }} />

          <p>
            <strong>PPE:</strong>{" "}
            {selectedRecord.ppe_safe ? "Safe" : ""}{" "}
            {selectedRecord.ppe_concern ? "Concern" : ""}
            <br />
            <em>{selectedRecord.ppe_comments}</em>
          </p>

          <p>
            <strong>Proper Position:</strong>{" "}
            {selectedRecord.position_safe ? "Safe" : ""}{" "}
            {selectedRecord.position_concern ? "Concern" : ""}
            <br />
            <em>{selectedRecord.position_comments}</em>
          </p>

          <p>
            <strong>Tools & Equipment:</strong>{" "}
            {selectedRecord.tools_safe ? "Safe" : ""}{" "}
            {selectedRecord.tools_concern ? "Concern" : ""}
            <br />
            <em>{selectedRecord.tools_comments}</em>
          </p>

          <p>
            <strong>Unsafe Conditions:</strong>{" "}
            {selectedRecord.conditions_safe ? "Safe" : ""}{" "}
            {selectedRecord.conditions_concern ? "Concern" : ""}
            <br />
            <em>{selectedRecord.conditions_comments}</em>
          </p>

          <hr style={{ margin: "1rem 0" }} />

          <p>
            <strong>What is/could be unsafe about the activity?</strong>
            <br />
            {selectedRecord.unsafe_about_activity}
          </p>

          <p>
            <strong>What have you done to promote safety today?</strong>
            <br />
            {selectedRecord.promote_safety}
          </p>

          <p>
            <strong>Team Member Comments:</strong>
            <br />
            {selectedRecord.team_member_comments}
          </p>

          <p>
            <strong>Observer Comments:</strong>
            <br />
            {selectedRecord.observer_comments}
          </p>

          <p>
            <strong>Follow‑up Requested:</strong>{" "}
            {selectedRecord.followup_contact || "—"}
          </p>

          <hr style={{ margin: "1rem 0" }} />

          <p>
            <strong>Status:</strong>{" "}
            <select
              value={selectedRecord.status}
              onChange={(e) =>
                updateStatus(selectedRecord.id, e.target.value)
              }
              style={{
                padding: "0.3rem 0.5rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            >
              <option value="Open">Open</option>
              <option value="In-Review">In-Review</option>
              <option value="Closed">Closed</option>
            </select>
          </p>

          <button
            onClick={handleExportEmail}
            style={{
              marginTop: "0.5rem",
              marginBottom: "0.75rem",
              padding: "0.6rem 1rem",
              backgroundColor: "#0066cc",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Export to Email
          </button>

          {selectedRecord.photo_paths &&
            selectedRecord.photo_paths.length > 0 && (
              <div style={{ marginTop: "1rem" }}>
                <strong>Photo:</strong>
                <div style={{ marginTop: "0.5rem" }}>
                  <img
                    src={`${API_BASE}/uploads/${selectedRecord.photo_paths[0]}`}
                    alt="BBS"
                    style={{
                      maxWidth: "100%",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      setPhotoViewer(selectedRecord.photo_paths[0])
                    }
                  />
                </div>
              </div>
            )}
        </div>
      )}

      {/* CREATE OBSERVATION PANEL */}
      {showCreate && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            height: "100vh",
            width: "460px",
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
            <h2 style={{ margin: 0 }}>New Observation (Admin)</h2>
            <button
              onClick={() => setShowCreate(false)}
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

          <form
            onSubmit={handleCreateSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            <div>
              <label>
                <strong>Observer ID</strong>
              </label>
              <input
                type="text"
                name="observer_id"
                value={createForm.observer_id}
                onChange={handleCreateChange}
                style={{
                  width: "100%",
                  padding: "0.4rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
                required
              />
            </div>

            <div>
              <label>
                <strong>Observer Name</strong>
              </label>
              <input
                type="text"
                name="observer_name"
                value={createForm.observer_name}
                onChange={handleCreateChange}
                style={{
                  width: "100%",
                  padding: "0.4rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
                required
              />
            </div>

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
                }}
                required
              />
            </div>

            <div>
              <label>
                <strong>Additional Observers (IDs, comma separated)</strong>
              </label>
              <input
                type="text"
                name="additional_observers"
                value={createForm.additional_observers}
                onChange={handleCreateChange}
                style={{
                  width: "100%",
                  padding: "0.4rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
            </div>

            <div>
              <label>
                <strong>Area</strong>
              </label>
              <input
                type="text"
                name="area"
                value={createForm.area}
                onChange={handleCreateChange}
                style={{
                  width: "100%",
                  padding: "0.4rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
            </div>

            <div>
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
                }}
              />
            </div>

            <div>
              <label>
                <strong>Job Area</strong>
              </label>
              <input
                type="text"
                name="job_area"
                value={createForm.job_area}
                onChange={handleCreateChange}
                style={{
                  width: "100%",
                  padding: "0.4rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
            </div>

            <div>
              <label>
                <strong>Job Task</strong>
              </label>
              <input
                type="text"
                name="job_task"
                value={createForm.job_task}
                onChange={handleCreateChange}
                style={{
                  width: "100%",
                  padding: "0.4rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
            </div>

            <div>
              <label>
                <strong>PPE Comments</strong>
              </label>
              <textarea
                name="ppe_comments"
                value={createForm.ppe_comments}
                onChange={handleCreateChange}
                style={{
                  width: "100%",
                  padding: "0.4rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  height: "60px",
                }}
              />
            </div>

            <div>
              <label>
                <strong>Position Comments</strong>
              </label>
              <textarea
                name="position_comments"
                value={createForm.position_comments}
                onChange={handleCreateChange}
                style={{
                  width: "100%",
                  padding: "0.4rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  height: "60px",
                }}
              />
            </div>

            <div>
              <label>
                <strong>Tools Comments</strong>
              </label>
              <textarea
                name="tools_comments"
                value={createForm.tools_comments}
                onChange={handleCreateChange}
                style={{
                  width: "100%",
                  padding: "0.4rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  height: "60px",
                }}
              />
            </div>

            <div>
              <label>
                <strong>Unsafe Conditions Comments</strong>
              </label>
              <textarea
                name="conditions_comments"
                value={createForm.conditions_comments}
                onChange={handleCreateChange}
                style={{
                  width: "100%",
                  padding: "0.4rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  height: "60px",
                }}
              />
            </div>

            <div>
              <label>
                <strong>What is/could be unsafe?</strong>
              </label>
              <textarea
                name="unsafe_about_activity"
                value={createForm.unsafe_about_activity}
                onChange={handleCreateChange}
                style={{
                  width: "100%",
                  padding: "0.4rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  height: "60px",
                }}
              />
            </div>

            <div>
              <label>
                <strong>What have you done to promote safety?</strong>
              </label>
              <textarea
                name="promote_safety"
                value={createForm.promote_safety}
                onChange={handleCreateChange}
                style={{
                  width: "100%",
                  padding: "0.4rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  height: "60px",
                }}
              />
            </div>

            <div>
              <label>
                <strong>Team Member Comments</strong>
              </label>
              <textarea
                name="team_member_comments"
                value={createForm.team_member_comments}
                onChange={handleCreateChange}
                style={{
                  width: "100%",
                  padding: "0.4rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  height: "60px",
                }}
              />
            </div>

            <div>
              <label>
                <strong>Observer Comments</strong>
              </label>
              <textarea
                name="observer_comments"
                value={createForm.observer_comments}
                onChange={handleCreateChange}
                style={{
                  width: "100%",
                  padding: "0.4rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  height: "60px",
                }}
              />
            </div>

            <div>
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
              Save Observation
            </button>
          </form>
        </div>
      )}

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
            src={`${API_BASE}/uploads/${photoViewer}`}
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