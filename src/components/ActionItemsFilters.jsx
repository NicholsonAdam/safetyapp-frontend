import EmployeeAutocomplete from "./EmployeeAutocomplete";

export default function ActionItemsFilters({ filters, setFilters, reload }) {
  const update = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    reload();
  };

  // ENUM lists (match modal + table)
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

  const pretty = (str) =>
    str
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  // Element options depend on classification filter (or show all if none)
  const elementOptions =
    filters.classification === "SAFETY"
      ? SAFETY_ELEMENTS
      : filters.classification === "CI"
      ? CI_ELEMENTS
      : filters.classification === "GENERAL"
      ? ALL_ELEMENTS
      : ALL_ELEMENTS;

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
      {/* STATUS (ENUM) */}
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
        <option value="OPEN">Open</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="DELAYED">Delayed</option>
        <option value="CANCELED">Canceled</option>
        <option value="DUPLICATE_SUBMISSION">Duplicate Submission</option>
        <option value="COMPLETE">Complete</option>
        <option value="ON_HOLD">On Hold</option>
      </select>

      {/* CLASSIFICATION (ENUM) */}
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
        <option value="SAFETY">Safety</option>
        <option value="CI">CI</option>
        <option value="GENERAL">General</option>
      </select>

      {/* ELEMENT (NEW) */}
      <select
        value={filters.element || ""}
        onChange={(e) => update("element", e.target.value)}
        style={{
          padding: "8px",
          borderRadius: "6px",
          border: "1px solid #C4C4C4",
          background: "#F5F5F5",
        }}
      >
        <option value="">All Elements</option>
        {elementOptions.map((el) => (
          <option key={el} value={el}>
            {pretty(el)}
          </option>
        ))}
      </select>

      {/* DEPARTMENT (ENUM) */}
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
