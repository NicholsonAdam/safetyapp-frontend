import { useState } from "react";
import EmployeeAutocomplete from "./EmployeeAutocomplete";

export default function NewActionItemModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    submitted_by_user_id: "",
    current_owner_user_id: "",
    description: "",
    department: "",
    classification: "",
    element: "",        // <-- NEW FIELD
    status: "OPEN",     // ENUM
    notes: "",
  });

  const [error, setError] = useState("");

  // ---------------------------------------------
  // ELEMENT LISTS (ENUM VALUES)
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

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const submit = () => {
    if (!form.submitted_by_user_id.trim()) {
      setError("Submitter ID is required.");
      return;
    }
    if (!form.current_owner_user_id) {
      setError("Owner is required.");
      return;
    }
    if (!form.description.trim()) {
      setError("Description is required.");
      return;
    }
    if (!form.department) {
      setError("Department is required.");
      return;
    }
    if (!form.classification) {
      setError("Classification is required.");
      return;
    }
    if (!form.element) {
      setError("Element is required.");
      return;
    }

    setError("");

    const payload = {
      ...form,
      submitted_by_user_id: form.submitted_by_user_id.trim(),
      description: form.description.trim(),
      notes: form.notes.trim(),
    };

    onCreate(payload);
  };

  // Pretty print ENUM → Label
  const pretty = (str) =>
    str
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  // Determine which element list to show
  const elementOptions =
    form.classification === "SAFETY"
      ? SAFETY_ELEMENTS
      : form.classification === "CI"
      ? CI_ELEMENTS
      : form.classification === "GENERAL"
      ? ALL_ELEMENTS
      : [];

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "#FFFFFF",
          padding: 28,
          width: 440,
          borderRadius: "10px",
          boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
        }}
      >
        <h2
          style={{
            marginBottom: 20,
            color: "#333333",
            fontWeight: "700",
            borderBottom: "2px solid #B30000",
            paddingBottom: "8px",
          }}
        >
          New Action Item
        </h2>

        {/* SUBMITTER */}
        <input
          placeholder="Submitter ID"
          value={form.submitted_by_user_id}
          onChange={(e) => update("submitted_by_user_id", e.target.value)}
          style={{
            width: "100%",
            marginBottom: 12,
            padding: 10,
            borderRadius: "6px",
            border: "1px solid #C4C4C4",
            background: "#F5F5F5",
          }}
        />

        {/* OWNER */}
        <div style={{ marginBottom: 12 }}>
          <EmployeeAutocomplete
            value={form.current_owner_user_id}
            onSelect={(emp) =>
              update("current_owner_user_id", emp.employee_id)
            }
          />
        </div>

        {/* DESCRIPTION */}
        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          style={{
            width: "100%",
            marginBottom: 12,
            padding: 10,
            borderRadius: "6px",
            border: "1px solid #C4C4C4",
            background: "#F5F5F5",
          }}
        />

        {/* DEPARTMENT */}
        <select
          value={form.department}
          onChange={(e) => update("department", e.target.value)}
          style={{
            width: "100%",
            marginBottom: 12,
            padding: 10,
            borderRadius: "6px",
            border: "1px solid #C4C4C4",
            background: "#F5F5F5",
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

        {/* CLASSIFICATION */}
        <select
          value={form.classification}
          onChange={(e) => {
            update("classification", e.target.value);
            update("element", ""); // reset element when classification changes
          }}
          style={{
            width: "100%",
            marginBottom: 12,
            padding: 10,
            borderRadius: "6px",
            border: "1px solid #C4C4C4",
            background: "#F5F5F5",
          }}
        >
          <option value="">Select Classification</option>
          <option value="SAFETY">Safety</option>
          <option value="CI">CI</option>
          <option value="GENERAL">General</option>
        </select>

        {/* ELEMENT (NEW) */}
        <select
          value={form.element}
          onChange={(e) => update("element", e.target.value)}
          style={{
            width: "100%",
            marginBottom: 12,
            padding: 10,
            borderRadius: "6px",
            border: "1px solid #C4C4C4",
            background: "#F5F5F5",
          }}
        >
          <option value="">Select Element</option>
          {elementOptions.map((el) => (
            <option key={el} value={el}>
              {pretty(el)}
            </option>
          ))}
        </select>

        {/* STATUS */}
        <select
          value={form.status}
          onChange={(e) => update("status", e.target.value)}
          style={{
            width: "100%",
            marginBottom: 12,
            padding: 10,
            borderRadius: "6px",
            border: "1px solid #C4C4C4",
            background: "#F5F5F5",
          }}
        >
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DELAYED">Delayed</option>
          <option value="CANCELED">Canceled</option>
          <option value="DUPLICATE_SUBMISSION">Duplicate Submission</option>
          <option value="COMPLETE">Complete</option>
          <option value="ON_HOLD">On Hold</option>
        </select>

        {/* NOTES */}
        <textarea
          placeholder="Notes"
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          style={{
            width: "100%",
            marginBottom: 16,
            padding: 10,
            height: 80,
            borderRadius: "6px",
            border: "1px solid #C4C4C4",
            background: "#F5F5F5",
          }}
        />

        {error && (
          <div style={{ color: "red", marginBottom: 12, fontWeight: "600" }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button
            onClick={submit}
            style={{
              padding: "10px 16px",
              background: "#B30000",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            }}
          >
            Create
          </button>

          <button
            onClick={onClose}
            style={{
              padding: "10px 16px",
              background: "#CCCCCC",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
