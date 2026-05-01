import InlineCell from "./InlineCell";
import EmployeeAutocomplete from "./EmployeeAutocomplete";

export default function ActionItemsTable({
  items,
  setItems,
  reload,
  filters,
  setFilters,
}) {
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

  const updateField = async (id, field, value) => {
    await fetch(`${import.meta.env.VITE_API_URL}/action-items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });

    reload();
  };

  const formatDate = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleDateString();
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
      case "Open":
        return { ...base, background: "#f4b400" };
      case "In Progress":
        return { ...base, background: "#4285f4" };
      case "Delayed":
        return { ...base, background: "#B30000" };
      case "Canceled":
        return { ...base, background: "#5f6368" };
      case "Duplicate Submission":
        return { ...base, background: "#9aa0a6" };
      case "Complete":
        return { ...base, background: "#0f9d58" };
      case "On Hold":
        return { ...base, background: "#ab47bc" };
      default:
        return { ...base, background: "#444" };
    }
  };

  const departments = [
    "Body Prep",
    "Press",
    "Glazeline",
    "Glaze Prep",
    "Kiln",
    "LGV",
    "Sorting",
    "Maintenance",
    "Administration",
    "Facility",
  ];

  const classifications = ["Safety", "CI", "General"];

  const statuses = [
    "Open",
    "In Progress",
    "Delayed",
    "Canceled",
    "Duplicate Submission",
    "Complete",
    "On Hold",
  ];

  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        background: "white",
        borderRadius: "8px",
        overflow: "hidden",
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

            {/* SUBMITTER: NOT EDITABLE */}
            <td style={{ padding: 10 }}>{row.submitted_by_user_id}</td>

            {/* OWNER: AUTOCOMPLETE (stores ID) */}
            <td style={{ padding: 10 }}>
              <EmployeeAutocomplete
                value={row.current_owner_user_id}
                onSelect={(emp) =>
                  updateField(row.id, "current_owner_user_id", emp.employee_id)
                }
              />
            </td>

            {/* DESCRIPTION: INLINE EDIT */}
            <td style={{ padding: 10 }}>
              <InlineCell
                value={row.description}
                rowId={row.id}
                field="description"
                onSave={updateField}
              />
            </td>

            {/* DEPARTMENT: DROPDOWN, SHOW EXISTING VALUE */}
            <td style={{ padding: 10 }}>
              <select
                value={row.department || ""}
                onChange={(e) =>
                  updateField(row.id, "department", e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "4px",
                  borderRadius: "4px",
                  border: "1px solid #C4C4C4",
                  background: "#FFFFFF",
                }}
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </td>

            {/* CLASSIFICATION: DROPDOWN */}
            <td style={{ padding: 10 }}>
              <select
                value={row.classification || ""}
                onChange={(e) =>
                  updateField(row.id, "classification", e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "4px",
                  borderRadius: "4px",
                  border: "1px solid #C4C4C4",
                  background: "#FFFFFF",
                }}
              >
                <option value="">Select Classification</option>
                {classifications.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </td>

            {/* STATUS: DROPDOWN + COLOR BADGE */}
            <td style={{ padding: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <select
                  value={row.status || ""}
                  onChange={(e) =>
                    updateField(row.id, "status", e.target.value)
                  }
                  style={{
                    padding: "4px",
                    borderRadius: "4px",
                    border: "1px solid #C4C4C4",
                    background: "#FFFFFF",
                  }}
                >
                  <option value="">Select Status</option>
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {row.status && (
                  <div style={badgeStyle(row.status)}>{row.status}</div>
                )}
              </div>
            </td>

            {/* NOTES: INLINE EDIT */}
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
