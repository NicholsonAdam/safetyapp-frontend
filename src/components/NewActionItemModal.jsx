import { useState } from "react";
import EmployeeAutocomplete from "./EmployeeAutocomplete";

export default function NewActionItemModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    submitted_by_user_id: "",
    current_owner_user_id: "",
    description: "",
    department: "",
    classification: "",
    status: "OPEN", // backend enum
    notes: "",
  });

  const [error, setError] = useState("");

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const submit = () => {
    // Required fields
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

    setError("");

    // Normalize values for backend
    const payload = {
      ...form,
      submitted_by_user_id: form.submitted_by_user_id.trim(),
      description: form.description.trim(),
      notes: form.notes.trim(),

      // Convert UI → backend enums
      classification: form.classification.toUpperCase(),
      department: form.department.toUpperCase().replace(" ", "_"),
      status: form.status.toUpperCase().replace(" ", "_"),
    };

    onCreate(payload);
  };

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
        {/* HEADER */}
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
          <option value="BODY PREP">Body Prep</option>
          <option value="PRESS">Press</option>
          <option value="GLAZELINE">Glazeline</option>
          <option value="GLAZE PREP">Glaze Prep</option>
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
          onChange={(e) => update("classification", e.target.value)}
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

        {/* BUTTONS */}
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
