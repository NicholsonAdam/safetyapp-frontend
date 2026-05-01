import InlineCell from "./InlineCell";
import EmployeeAutocomplete from "./EmployeeAutocomplete";

export default function ActionItemsTable({
  items,
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
    return d.toLocaleDateString();
  };

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

            {/* SUBMITTER — LOCKED */}
            <td style={{ padding: 10 }}>{row.submitted_by_user_id}</td>

            {/* OWNER — AUTOCOMPLETE (NAME-BASED) */}
            <td style={{ padding: 10 }}>
              <EmployeeAutocomplete
                value={row.current_owner_user_id}
                onSelect={(emp) =>
                  updateField(row.id, "current_owner_user_id", emp.employee_id)
                }
              />
            </td>

            {/* DESCRIPTION — INLINE EDIT */}
            <td style={{ padding: 10 }}>
              <InlineCell
                value={row.description}
                rowId={row.id}
                field="description"
                onSave={updateField}
              />
            </td>

            {/* DEPARTMENT — DROPDOWN */}
            <td style={{ padding: 10 }}>
              <select
                value={row.department || ""}
                onChange={(e) =>
                  updateField(row.id, "department", e.target.value)
                }
                style={{
                  padding: "6px",
                  borderRadius: "6px",
                  border: "1px solid #C4C4C4",
                }}
              >
                <option value="">Select Department</option>
                <option value="Body Prep">Body Prep</option>
                <option value="Press">Press</option>
                <option value="Glazeline">Glazeline</option>
                <option value="Glaze Prep">Glaze Prep</option>
                <option value="Kiln">Kiln</option>
                <option value="LGV">LGV</option>
                <option value="Sorting">Sorting</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Administration">Administration</option>
                <option value="Facility">Facility</option>
              </select>
            </td>

            {/* CLASSIFICATION — DROPDOWN */}
            <td style={{ padding: 10 }}>
              <select
                value={row.classification || ""}
                onChange={(e) =>
                  updateField(row.id, "classification", e.target.value)
                }
                style={{
                  padding: "6px",
                  borderRadius: "6px",
                  border: "1px solid #C4C4C4",
                }}
              >
                <option value="">Select Classification</option>
                <option value="Safety">Safety</option>
                <option value="CI">CI</option>
                <option value="General">General</option>
              </select>
            </td>

            {/* STATUS — DROPDOWN */}
            <td style={{ padding: 10 }}>
              <select
                value={row.status || "Open"}
                onChange={(e) => updateField(row.id, "status", e.target.value)}
                style={{
                  padding: "6px",
                  borderRadius: "6px",
                  border: "1px solid #C4C4C4",
                }}
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Delayed">Delayed</option>
                <option value="Canceled">Canceled</option>
                <option value="Duplicate Submission">Duplicate Submission</option>
                <option value="Complete">Complete</option>
                <option value="On Hold">On Hold</option>
              </select>
            </td>

            {/* NOTES — INLINE EDIT */}
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
