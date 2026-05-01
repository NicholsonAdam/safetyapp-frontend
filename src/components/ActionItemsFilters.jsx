import EmployeeAutocomplete from "./EmployeeAutocomplete";

export default function ActionItemsFilters({ filters, setFilters, reload }) {
  const update = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    reload();
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        background: "#FFFFFF",
        padding: "14px",
        borderRadius: "8px",
        alignItems: "center",
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
      }}
    >
      {/* STATUS */}
      <select
        value={filters.status}
        onChange={(e) => update("status", e.target.value)}
        style={{
          padding: "8px",
          borderRadius: "6px",
          border: "1px solid #C4C4C4",
          background: "#F5F5F5",
        }}
      >
        <option value="">All Statuses</option>
        <option value="Open">Open</option>
        <option value="In Progress">In Progress</option>
        <option value="Delayed">Delayed</option>
        <option value="Canceled">Canceled</option>
        <option value="Duplicate Submission">Duplicate Submission</option>
        <option value="Complete">Complete</option>
        <option value="On Hold">On Hold</option>
      </select>

      {/* CLASSIFICATION */}
      <select
        value={filters.classification}
        onChange={(e) => update("classification", e.target.value)}
        style={{
          padding: "8px",
          borderRadius: "6px",
          border: "1px solid #C4C4C4",
          background: "#F5F5F5",
        }}
      >
        <option value="">All Classifications</option>
        <option value="Safety">Safety</option>
        <option value="CI">CI</option>
        <option value="General">General</option>
      </select>

      {/* DEPARTMENT */}
      <select
        value={filters.department}
        onChange={(e) => update("department", e.target.value)}
        style={{
          padding: "8px",
          borderRadius: "6px",
          border: "1px solid #C4C4C4",
          background: "#F5F5F5",
        }}
      >
        <option value="">All Departments</option>
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

      {/* OWNER */}
      <div style={{ width: "220px" }}>
        <EmployeeAutocomplete
          value={filters.owner}
          onSelect={(emp) => update("owner", emp.employee_id)}
        />
      </div>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search description/notes"
        value={filters.search}
        onChange={(e) => update("search", e.target.value)}
        style={{
          flex: 1,
          padding: "8px",
          borderRadius: "6px",
          border: "1px solid #C4C4C4",
          background: "#F5F5F5",
        }}
      />
    </div>
  );
}
