import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL;

export default function AdminInspection() {
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [photoViewer, setPhotoViewer] = useState(null);

  const questionTitles = [
  "Are ladders being inspected?",
  "Are machine guards in place?",
  "Are chemicals properly labeled?",
  "Is PPE being worn correctly?",
  "Are walkways free of obstructions?",
  "Are emergency exits accessible?",
  "Are tools in good condition?",
  "Are electrical cords undamaged?",
  "Is housekeeping acceptable?",
  "Are safety procedures being followed?"
    ];

  const [showCreate, setShowCreate] = useState(false);
  const inputStyle = {
  width: "100%",
  padding: "0.4rem",
  borderRadius: "4px",
  border: "1px solid #ccc",
};

const textareaStyle = {
  width: "100%",
  padding: "0.4rem",
  borderRadius: "4px",
  border: "1px solid #ccc",
  height: "60px",
};

const [createForm, setCreateForm] = useState({
  inspector_id: "",
  inspector_name: "",
  date: "",
  department: "",
  area: "",
  shift: "",
  inspector_comments: "",
  photo: null,

  q1: "", q1_corrected: "na",
  q2: "", q2_corrected: "na",
  q3: "", q3_corrected: "na",
  q4: "", q4_corrected: "na",
  q5: "", q5_corrected: "na",
  q6: "", q6_corrected: "na",
  q7: "", q7_corrected: "na",
  q8: "", q8_corrected: "na",
  q9: "", q9_corrected: "na",
  q10: "", q10_corrected: "na",
});

  const [columnFilters, setColumnFilters] = useState({
    department: [],
    area: [],
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
      area: [],
      shift: [],
    });
    setOpenFilter(null);
  };

  const fetchInspections = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/inspection`);
      const data = await res.json();
      setRecords(data);
    } catch (err) {
      console.error("Error fetching inspection records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setOpenFilter(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const formatDate = (value) => {
    if (!value) return "";
    const d = new Date(value);
    return d.toLocaleDateString("en-US");
  };

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

  const applyColumnFilters = (record) => {
    for (const field in columnFilters) {
      const selected = columnFilters[field];
      if (selected.length > 0) {
        const value = record[field] ?? "";
        if (!selected.includes(value)) return false;
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
        r.inspector_name,
        r.department,
        r.area,
        r.shift,
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
        return (new Date(va) - new Date(vb)) * dir;
      }

      const sa = (va || "").toString().toLowerCase();
      const sb = (vb || "").toString().toLowerCase();
      if (sa < sb) return -1 * dir;
      if (sa > sb) return 1 * dir;
      return 0;
    });

  const getUniqueValues = (field) => {
    const set = new Set();
    records.forEach((r) => {
      if (r[field]) set.add(r[field]);
    });
    return Array.from(set).sort();
  };

// =========================
// CREATE FORM HANDLERS
// =========================
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

  const fd = new FormData();

  Object.keys(createForm).forEach((key) => {
    if (key === "photo") {
      if (createForm.photo) fd.append("photo", createForm.photo);
    } else {
      fd.append(key, createForm[key]);
    }
  });

  try {
    const res = await fetch(`${API_BASE}/api/inspection`, {
      method: "POST",
      body: fd,
    });

    if (!res.ok) {
      console.error("Error creating inspection");
      return;
    }

    await fetchInspections();
    setShowCreate(false);

    setCreateForm({
      inspector_id: "",
      inspector_name: "",
      date: "",
      department: "",
      area: "",
      shift: "",
      inspector_comments: "",
      photo: null,

      q1: "", q1_corrected: "na",
      q2: "", q2_corrected: "na",
      q3: "", q3_corrected: "na",
      q4: "", q4_corrected: "na",
      q5: "", q5_corrected: "na",
      q6: "", q6_corrected: "na",
      q7: "", q7_corrected: "na",
      q8: "", q8_corrected: "na",
      q9: "", q9_corrected: "na",
      q10: "", q10_corrected: "na",
    });
  } catch (err) {
    console.error("Error creating inspection:", err);
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
        position: "relative",
      }}
    >
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
          Inspection Checklist Records
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
    }}
  >
    + New Inspection
  </button>
</div>
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
    }}
  >
    ← Back to Admin Dashboard
  </button>
</div>

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
          Inspection Records
        </h2>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
            gap: "1rem",
          }}
        >
          <input
            type="text"
            placeholder="Search by name, area, department..."
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

          <div
            style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}
            onClick={(e) => e.stopPropagation()}
          >
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
                Area{" "}
                {columnFilters.area.length > 0
                  ? `(${columnFilters.area.length})`
                  : ""}{" "}
                ⏷
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
                    onClick={() => handleSort("inspector_name")}
                  >
                    Inspector{getSortArrow("inspector_name")}
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
                    }}
                  >
                    Photo
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
                    <td style={{ padding: "8px" }}>{r.inspector_name}</td>
                    <td style={{ padding: "8px" }}>{r.department}</td>
                    <td style={{ padding: "8px" }}>{r.area}</td>
                    <td style={{ padding: "8px" }}>{r.shift}</td>
                    <td style={{ padding: "8px" }}>
                      {r.photo_path ? "Yes" : "No"}
                    </td>
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
            <h2 style={{ margin: 0 }}>Inspection #{selectedRecord.id}</h2>
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
            <strong>Inspector:</strong> {selectedRecord.inspector_name} (
            {selectedRecord.inspector_id})
          </p>
          <p>
            <strong>Department:</strong> {selectedRecord.department}
          </p>
          <p>
            <strong>Area:</strong> {selectedRecord.area}
          </p>
          <p>
            <strong>Shift:</strong> {selectedRecord.shift}
          </p>

          <hr style={{ margin: "1rem 0" }} />

          <p>
            <strong>Inspector Comments:</strong>
            <br />
            {selectedRecord.inspector_comments || "—"}
          </p>

          <hr style={{ margin: "1rem 0" }} />

          <h3 style={{ marginTop: "0.5rem" }}>Checklist Questions</h3>

          {Array.from({ length: 10 }).map((_, idx) => {
            const qKey = `q${idx + 1}`;
            const cKey = `q${idx + 1}_corrected`;
            const label = `Q${idx + 1}`;
            return (
              <div key={qKey} style={{ marginBottom: "0.6rem" }}>
                <strong>{questionTitles[idx]}:</strong> {selectedRecord[qKey] || "—"}
                {selectedRecord[qKey] || "—"}{" "}
                <br />
                <span>
                  <strong>Corrected:</strong>{" "}
                  {selectedRecord[cKey] || "—"}
                </span>
              </div>
            );
          })}

          <hr style={{ margin: "1rem 0" }} />

          

          {selectedRecord.photo_path && (
            <div style={{ marginTop: "1rem" }}>
              <strong>Photo:</strong>
              <div style={{ marginTop: "0.5rem" }}>
                <img
                  src={`${API_BASE}/uploads/${selectedRecord.photo_path}`}
                  alt="Inspection"
                  style={{
                    maxWidth: "100%",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                  onClick={() => setPhotoViewer(selectedRecord.photo_path)}
                />
              </div>
            </div>
          )}
        </div>
      )}

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
                <h2 style={{ margin: 0 }}>New Inspection (Admin)</h2>
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
                    <label><strong>Inspector ID</strong></label>
                    <input
                    type="text"
                    name="inspector_id"
                    value={createForm.inspector_id}
                    onChange={handleCreateChange}
                    style={inputStyle}
                    required
                    />
                </div>

                <div>
                    <label><strong>Inspector Name</strong></label>
                    <input
                    type="text"
                    name="inspector_name"
                    value={createForm.inspector_name}
                    onChange={handleCreateChange}
                    style={inputStyle}
                    required
                    />
                </div>

                <div>
                    <label><strong>Date</strong></label>
                    <input
                    type="date"
                    name="date"
                    value={createForm.date}
                    onChange={handleCreateChange}
                    style={inputStyle}
                    required
                    />
                </div>

                <div>
                    <label><strong>Department</strong></label>
                    <input
                    type="text"
                    name="department"
                    value={createForm.department}
                    onChange={handleCreateChange}
                    style={inputStyle}
                    />
                </div>

                <div>
                    <label><strong>Area</strong></label>
                    <input
                    type="text"
                    name="area"
                    value={createForm.area}
                    onChange={handleCreateChange}
                    style={inputStyle}
                    />
                </div>

                <div>
                    <label><strong>Shift</strong></label>
                    <input
                    type="text"
                    name="shift"
                    value={createForm.shift}
                    onChange={handleCreateChange}
                    style={inputStyle}
                    />
                </div>

                <div>
                    <label><strong>Inspector Comments</strong></label>
                    <textarea
                    name="inspector_comments"
                    value={createForm.inspector_comments}
                    onChange={handleCreateChange}
                    style={textareaStyle}
                    />
                </div>

                <h3>Checklist Questions</h3>

                {Array.from({ length: 10 }).map((_, idx) => {
                    const qKey = `q${idx + 1}`;
                    const cKey = `q${idx + 1}_corrected`;

                    return (
                    <div key={qKey} style={{ marginBottom: "1rem" }}>
                        <label><strong>{questionTitles[idx]}</strong></label>

                        <div style={{ display: "flex", gap: "1rem", marginTop: "0.3rem" }}>
                        <label>
                            <input
                            type="radio"
                            name={qKey}
                            value="yes"
                            checked={createForm[qKey] === "yes"}
                            onChange={handleCreateChange}
                            /> Yes
                        </label>

                        <label>
                            <input
                            type="radio"
                            name={qKey}
                            value="no"
                            checked={createForm[qKey] === "no"}
                            onChange={handleCreateChange}
                            /> No
                        </label>
                        </div>

                        <label style={{ marginTop: "0.5rem", display: "block" }}>
                        Corrected?
                        </label>

                        <div style={{ display: "flex", gap: "1rem", marginTop: "0.3rem" }}>
                        <label>
                            <input
                            type="radio"
                            name={cKey}
                            value="yes"
                            checked={createForm[cKey] === "yes"}
                            onChange={handleCreateChange}
                            /> Yes
                        </label>

                        <label>
                            <input
                            type="radio"
                            name={cKey}
                            value="no"
                            checked={createForm[cKey] === "no"}
                            onChange={handleCreateChange}
                            /> No
                        </label>

                        <label>
                            <input
                            type="radio"
                            name={cKey}
                            value="na"
                            checked={createForm[cKey] === "na"}
                            onChange={handleCreateChange}
                            /> N/A
                        </label>
                        </div>
                    </div>
                    );
                })}

                <div>
                    <label><strong>Upload Photo</strong></label>
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
                    Save Inspection
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