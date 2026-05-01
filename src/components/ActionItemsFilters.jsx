import { useState } from "react";
import EmployeeAutocomplete from "./EmployeeAutocomplete";

export default function ActionItemsFilters({ filters, setFilters, reload }) {
  const [openMenu, setOpenMenu] = useState(null);

  const toggleValue = (field, value) => {
    setFilters((prev) => {
      const exists = prev[field].includes(value);
      const updated = exists
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value];

      return { ...prev, [field]: updated };
    });

    reload();
  };

  const clearAll = (field) => {
    setFilters((prev) => ({ ...prev, [field]: [] }));
    reload();
  };

  const menuStyle = {
    position: "absolute",
    top: "42px",
    left: 0,
    background: "white",
    border: "1px solid #C4C4C4",
    borderRadius: "6px",
    padding: "10px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
    zIndex: 9999,
    width: "200px",
  };

  const buttonStyle = {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #C4C4C4",
    background: "#F5F5F5",
    cursor: "pointer",
    fontWeight: "600",
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
        position: "relative",
      }}
    >
      {/* STATUS FILTER */}
      <div style={{ position: "relative" }}>
        <button
          style={buttonStyle}
          onClick={() => setOpenMenu(openMenu === "status" ? null : "status")}
        >
          Status ▾
        </button>

        {openMenu === "status" && (
          <div style={menuStyle}>
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={filters.status.includes("Open")}
                  onChange={() => toggleValue("status", "Open")}
                />
                Open
              </label>
            </div>

            <div>
              <label>
                <input
                  type="checkbox"
                  checked={filters.status.includes("In Progress")}
                  onChange={() => toggleValue("status", "In Progress")}
                />
                In Progress
              </label>
            </div>

            <div>
              <label>
                <input
                  type="checkbox"
                  checked={filters.status.includes("Delayed")}
                  onChange={() => toggleValue("status", "Delayed")}
                />
                Delayed
              </label>
            </div>

            <div>
              <label>
                <input
                  type="checkbox"
                  checked={filters.status.includes("Canceled")}
                  onChange={() => toggleValue("status", "Canceled")}
                />
                Canceled
              </label>
            </div>

            <div>
              <label>
                <input
                  type="checkbox"
                  checked={filters.status.includes("Duplicate Submission")}
                  onChange={() =>
                    toggleValue("status", "Duplicate Submission")
                  }
                />
                Duplicate Submission
              </label>
            </div>

            <div>
              <label>
                <input
                  type="checkbox"
                  checked={filters.status.includes("Complete")}
                  onChange={() => toggleValue("status", "Complete")}
                />
                Complete
              </label>
            </div>

            <div>
              <label>
                <input
                  type="checkbox"
                  checked={filters.status.includes("On Hold")}
                  onChange={() => toggleValue("status", "On Hold")}
                />
                On Hold
              </label>
            </div>

            <button
              style={{
                marginTop: "8px",
                width: "100%",
                padding: "6px",
                background: "#B30000",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
              onClick={() => clearAll("status")}
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* CLASSIFICATION FILTER */}
      <div style={{ position: "relative" }}>
        <button
          style={buttonStyle}
          onClick={() =>
            setOpenMenu(openMenu === "classification" ? null : "classification")
          }
        >
          Classification ▾
        </button>

        {openMenu === "classification" && (
          <div style={menuStyle}>
            {["Safety", "CI", "General"].map((c) => (
              <div key={c}>
                <label>
                  <input
                    type="checkbox"
                    checked={filters.classification.includes(c)}
                    onChange={() => toggleValue("classification", c)}
                  />
                  {c}
                </label>
              </div>
            ))}

            <button
              style={{
                marginTop: "8px",
                width: "100%",
                padding: "6px",
                background: "#B30000",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
              onClick={() => clearAll("classification")}
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* DEPARTMENT FILTER */}
      <div style={{ position: "relative" }}>
        <button
          style={buttonStyle}
          onClick={() =>
            setOpenMenu(openMenu === "department" ? null : "department")
          }
        >
          Department ▾
        </button>

        {openMenu === "department" && (
          <div style={menuStyle}>
            {[
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
            ].map((d) => (
              <div key={d}>
                <label>
                  <input
                    type="checkbox"
                    checked={filters.department.includes(d)}
                    onChange={() => toggleValue("department", d)}
                  />
                  {d}
                </label>
              </div>
            ))}

            <button
              style={{
                marginTop: "8px",
                width: "100%",
                padding: "6px",
                background: "#B30000",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
              onClick={() => clearAll("department")}
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* OWNER FILTER */}
      <div style={{ width: "220px" }}>
        <EmployeeAutocomplete
          value={filters.owner}
          onSelect={(emp) =>
            toggleValue("owner", emp.employee_id)
          }
        />
      </div>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search description/notes"
        value={filters.search}
        onChange={(e) => {
          setFilters((prev) => ({ ...prev, search: e.target.value }));
          reload();
        }}
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
