import InlineCell from "./InlineCell";

export default function ActionItemsTable({ items, setItems, reload, filters, setFilters }) {
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

        reload();
    };

  const updateField = async (id, field, value) => {
    await fetch(`/api/action-items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });

    reload();
  };

  return (
    <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
            <th onClick={() => handleSort("id")}>ID</th>
            <th onClick={() => handleSort("date_submitted")}>Date Submitted</th>
            <th onClick={() => handleSort("date_last_update")}>Last Update</th>
            <th onClick={() => handleSort("submitted_by_user_id")}>Submitter</th>
            <th onClick={() => handleSort("current_owner_user_id")}>Owner</th>
            <th onClick={() => handleSort("description")}>Description</th>
            <th onClick={() => handleSort("department")}>Department</th>
            <th onClick={() => handleSort("classification")}>Classification</th>
            <th onClick={() => handleSort("status")}>Status</th>
            <th onClick={() => handleSort("notes")}>Notes</th>
        </tr>
        </thead>

      <tbody>
        {items.map((row) => (
            <tr
                key={row.id}
                style={{
                backgroundColor:
                    row.date_last_update &&
                    new Date(row.date_last_update) < new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
                    ? "#f8d7da" // light red
                    : "transparent",
                }}
            >
            <td>{row.id}</td>
            <td>{row.date_submitted}</td>
            <td>{row.date_last_update}</td>

            <td>
              <InlineCell
                value={row.submitted_by_user_id}
                rowId={row.id}
                field="submitted_by_user_id"
                onSave={updateField}
              />
            </td>

            <td>
              <InlineCell
                value={row.current_owner_user_id}
                rowId={row.id}
                field="current_owner_user_id"
                onSave={updateField}
              />
            </td>

            <td>
              <InlineCell
                value={row.description}
                rowId={row.id}
                field="description"
                onSave={updateField}
              />
            </td>

            <td>
              <InlineCell
                value={row.department}
                rowId={row.id}
                field="department"
                onSave={updateField}
              />
            </td>

            <td>
              <InlineCell
                value={row.classification}
                rowId={row.id}
                field="classification"
                onSave={updateField}
              />
            </td>

            <td
                style={{
                    backgroundColor:
                    row.status === "Open"
                        ? "#fff3cd" // yellow
                        : row.status === "In Progress"
                        ? "#cfe2ff" // blue
                        : row.status === "Closed"
                        ? "#d1e7dd" // green
                        : "transparent",
                }}
            >
                <InlineCell
                    value={row.status}
                    rowId={row.id}
                    field="status"
                    onSave={updateField}
                />
            </td>

            <td>
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
