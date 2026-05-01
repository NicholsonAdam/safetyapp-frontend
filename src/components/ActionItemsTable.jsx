import { useEffect, useState } from "react";
import InlineCell from "./InlineCell";
import EmployeeAutocomplete from "./EmployeeAutocomplete";

export default function ActionItemsTable({
  items,
  setItems,
  reload,
  filters,
  setFilters,
}) {
  const [employees, setEmployees] = useState([]);
  const [editingOwnerId, setEditingOwnerId] = useState(null);

  // ---------------------------------------------
  // ELEMENT ENUM LISTS (MATCH MODAL)
  // ---------------------------------------------
  const SAFETY_ELEMENTS = [
    "LADDER_SAFETY",
    "HOUSEKEEPING",
    "LOTO",
    "HOT_WORK",
    "EYEWASH",
    "PPE",
    "FORKLIFT_SAFETY",
    "CHEMICAL_HANDLING",
    "SPILL_RESPONSE",
  ];

  const CI_ELEMENTS = [
    "5S",
    "SIX_SIGMA",
    "KAIZEN",
    "STANDARD_WORK",
    "ROOT_CAUSE_ANALYSIS",
    "VALUE_STREAM_MAPPING",
  ];

  const ALL_ELEMENTS = [...SAFETY_ELEMENTS, ...CI_ELEMENTS];

  // ---------------------------------------------
  // LOAD EMPLOYEES FOR OWNER NAME MAPPING
  // ---------------------------------------------
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/employees`);
        const data = await res.json();
        setEmployees(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load employees:", err);
      }
    };
    loadEmployees();
  }, []);

  const getEmployeeName = (id) => {
    if (!id) return "";
    const emp = employees.find(
      (e) => String(e.employee_id) === String(id)
    );
    return emp ? emp.name : String(id);
  };

  // ---------------------------------------------
  // SORTING
  // ---------------------------------------------
  const handleSort = (column) => {
    if (filters.sort === column) {
      setFilters((prev) => ({
        ...prev,
        direction: prev.direction === "asc" ? "desc" : "asc",
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        sort: column,
        direction: "asc",
      }));
    }
  };

  // ---------------------------------------------
  // UPDATE FIELD
  // ---------------------------------------------
  const updateField = async (id, field, value) => {
    await fetch(`${import.meta.env.VITE_API_URL}/action-items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });

    reload();
  };

  // ---------------------------------------------
  // HELPERS
  // ---------------------------------------------
  const formatDate = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleDateString();
  };

  const pretty = (str) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const badgeStyle = (status) => {
    const base = {
      padding: "4px 8px",
      borderRadius: "12px",
      color: "white",
      fontSize: "12px",
      display: "inline-block",
      textAlign: "center",
      fontWeight: "600",
    };

    switch (status) {
      case "OPEN":
        return { ...base, background: "#f4b400" };
      case "IN_PROGRESS":
        return { ...base, background: "#4285f4" };
      case "DELAYED":
        return { ...base, background: "#B30000" };
      case "CANCELED":
        return { ...base, background: "#5f6368" };
      case "DUPLICATE_SUBMISSION":
        return { ...base, background: "#9aa0a6" };
      case "COMPLETE":
        return { ...base, background: "#0f9d58" };
      case "ON_HOLD":
        return { ...base, background: "#ab47bc" };
      default:
        return { ...base, background: "#444" };
    }
  };

  // ---------------------------------------------
  // DETERMINE ELEMENT OPTIONS PER ROW
  // ---------------------------------------------
  const getElementOptions = (classification) => {
    if (classification === "SAFETY") return SAFETY_ELEMENTS;
    if (classification === "CI") return CI_ELEMENTS;
    if (classification === "GENERAL") return ALL_ELEMENTS;
    return [];
  };

  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        background: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
      }}
    >
      <thead>
        <tr
          style={{
            background: "#333333",
            color: "white",
            textAlign: "left",
          }}
        >
          {[
            ["id", "ID"],
            ["date_submitted", "Date Submitted"],
            ["date_last_update", "Last Update"],
            ["submitted_by_user_id", "Submitter"],
            ["current_owner_user_id", "Owner"],
            ["description", "Description"],
            ["department", "Department"],
            ["classification", "Classification"],
            ["element", "Element"], // <-- NEW COLUMN
            ["status", "Status"],
            ["notes", "Notes"],
          ].map(([key, label]) => (
            <th
              key={key}
              onClick={() => handleSort(key)}
              style={{
                padding: "12px",
                cursor: "pointer",
                fontWeight: "600",
                borderBottom: "2px solid #800000",
              }}
            >
              {label}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {items.map((row, index) => (
          <tr
            key={row.id}
            style={{
              background: index % 2 === 0 ? "#F5F5F5" : "white",
              borderBottom: "1px solid #E0E0E0",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#FFE5E5")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background =
                index % 2 === 0 ? "#F5F5F5" : "white")
            }
          >
            <td style={{ padding: 10 }}>{row.id}</td>
            <td style={{ padding: 10 }}>{formatDate(row.date_submitted)}</td>
            <td style={{ padding: 10 }}>{formatDate(row.date_last_update)}</td>

            {/* SUBMITTER */}
            <td style={{ padding: 10 }}>
              <InlineCell
                value={row.submitted_by_user_id}
                rowId={row.id}
                field="submitted_by_user_id"
                onSave={updateField}
              />
            </td>

            {/* OWNER */}
            <td style={{ padding: 10 }}>
              {editingOwnerId === row.id ? (
                <EmployeeAutocomplete
                  value={row.current_owner_user_id}
                  onSelect={(emp) => {
                    updateField(
                      row.id,
                      "current_owner_user_id",
                      emp.employee_id
                    );
                    setEditingOwnerId(null);
                  }}
                />
              ) : (
                <div
                  style={{ cursor: "pointer", color: "#333" }}
                  onClick={() => setEditingOwnerId(row.id)}
                >
                  {getEmployeeName(row.current_owner_user_id)}
                </div>
              )}
            </td>

            {/* DESCRIPTION */}
            <td style={{ padding: 10 }}>
              <InlineCell
                value={row.description}
                rowId={row.id}
                field="description"
                onSave={updateField}
              />
            </td>

            {/* DEPARTMENT */}
            <td style={{ padding: 10 }}>
              <select
                value={row.department || ""}
                onChange={(e) =>
                  updateField(row.id, "department", e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "4px 6px",
                  borderRadius: "4px",
                  border: "1px solid #C4C4C4",
                  background: "#FFFFFF",
                  fontSize: "13px",
                }}
              >
                <option value="">Select Department</option>
                <option value="BODY_PREP">Body Prep</option>
                <option value="PRESS">Press</option>
                <option value="GLAZELINE">Glazeline</option>
                <option value="GLAZE_PREP">Glaze Prep</option>
                <option value="KILN">Kiln</option>
                <option value="LGV">LGV</option>
                <option value="SORTING">Sorting</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="ADMINISTRATION">Administration</option>
                <option value="FACILITY">Facility</option>
              </select>
            </td>

            {/* CLASSIFICATION */}
            <td style={{ padding: 10 }}>
              <select
                value={row.classification || ""}
                onChange={(e) =>
                  updateField(row.id, "classification", e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "4px 6px",
                  borderRadius: "4px",
                  border: "1px solid #C4C4C4",
                  background: "#FFFFFF",
                  fontSize: "13px",
                }}
              >
                <option value="">Select Classification</option>
                <option value="SAFETY">Safety</option>
                <option value="CI">CI</option>
                <option value="GENERAL">General</option>
              </select>
            </td>

            {/* ELEMENT (NEW COLUMN) */}
            <td style={{ padding: 10 }}>
              <select
                value={row.element || ""}
                onChange={(e) =>
                  updateField(row.id, "element", e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "4px 6px",
                  borderRadius: "4px",
                  border: "1px solid #C4C4C4",
                  background: "#FFFFFF",
                  fontSize: "13px",
                }}
              >
                <option value="">Select Element</option>
                {getElementOptions(row.classification).map((el) => (
                  <option key={el} value={el}>
                    {pretty(el)}
                  </option>
                ))}
              </select>
            </td>

            {/* STATUS */}
            <td style={{ padding: 10 }}>
              <select
                value={row.status || ""}
                onChange={(e) =>
                  updateField(row.id, "status", e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "4px 6px",
                  borderRadius: "4px",
                  border: "1px solid #C4C4C4",
                  background: "#FFFFFF",
                  fontSize: "13px",
                  marginBottom: "4px",
                }}
              >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DELAYED">Delayed</option>
                <option value="CANCELED">Canceled</option>
                <option value="DUPLICATE_SUBMISSION">
                  Duplicate Submission
                </option>
                <option value="COMPLETE">Complete</option>
                <option value="ON_HOLD">On Hold</option>
              </select>

              <div style={badgeStyle(row.status)}>{pretty(row.status)}</div>
            </td>

            {/* NOTES */}
            <td style={{ padding: 10 }}>
              <InlineCell
                value={row.notes}
                rowId={row.id}
                field="notes"
                onSave={updateField}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
