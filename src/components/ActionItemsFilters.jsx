export default function ActionItemsFilters({ filters, setFilters, reload }) {
  const update = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    reload();
  };

  return (
    <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
      <select
        value={filters.status}
        onChange={(e) => update("status", e.target.value)}
      >
        <option value="">All Statuses</option>
        <option value="Open">Open</option>
        <option value="In Progress">In Progress</option>
        <option value="Closed">Closed</option>
      </select>

      <select
        value={filters.classification}
        onChange={(e) => update("classification", e.target.value)}
      >
        <option value="">All Classifications</option>
        <option value="Safety">Safety</option>
        <option value="CI">CI</option>
        <option value="General">General</option>
      </select>

      <select
        value={filters.department}
        onChange={(e) => update("department", e.target.value)}
        >
        <option value="">All Departments</option>
        <option value="Production">Production</option>
        <option value="Maintenance">Maintenance</option>
        <option value="Quality">Quality</option>
        <option value="Safety">Safety</option>
        <option value="Warehouse">Warehouse</option>
        </select>

        <select
        value={filters.owner}
        onChange={(e) => update("owner", e.target.value)}
        >
        <option value="">All Owners</option>
        <option value="1001">1001</option>
        <option value="1002">1002</option>
        <option value="1003">1003</option>
        <option value="1004">1004</option>
        </select>

      <input
        type="text"
        placeholder="Search description/notes"
        value={filters.search}
        onChange={(e) => update("search", e.target.value)}
        style={{ flex: 1 }}
      />
    </div>
  );
}
