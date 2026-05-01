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
    // ❌ DO NOT call reload() here — ActionItemsPage auto‑reloads on filter change
  };

  const updateField = async (id, field, value) => {
    await fetch(
      `${import.meta.env.VITE_API_URL}/action-items/${id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      }
    );

    reload(); // keep this — table edits should reload immediately
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
        return base;
    }
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
            <td style={{ padding: 10 }}>{row.date_submitted}</td>
            <td style={{ padding: 10 }}>{row.date_last_update}</td>

            <td style={{ padding: 10 }}>
              <InlineCell
                value={row.submitted_by_user_id}
                rowId={row.id}
                field="submitted_by_user_id"
                onSave={updateField}
              />
            </td>

            <td style={{ padding: 10 }}>
              <EmployeeAutocomplete
                value={row.current_owner_user_id}
                onSelect={(emp) =>
                  updateField(
                    row.id,
                    "current_owner_user_id",
                    emp.employee_id
                  )
                }
              />
            </td>

            <td style={{ padding: 10 }}>
              <InlineCell
                value={row.description}
                rowId={row.id}
                field="description"
                onSave={updateField}
              />
            </td>

            <td style={{ padding: 10 }}>
              <InlineCell
                value={row.department}
                rowId={row.id}
                field="department"
                onSave={updateField}
              />
            </td>

            <td style={{ padding: 10 }}>
              <InlineCell
                value={row.classification}
                rowId={row.id}
                field="classification"
                onSave={updateField}
              />
            </td>

            <td style={{ padding: 10 }}>
              <div style={badgeStyle(row.status)}>{row.status}</div>
            </td>

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
