import { useState } from "react";

export default function NewActionItemModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    submitted_by_user_id: "",
    current_owner_user_id: "",
    description: "",
    department: "",
    classification: "",
    status: "Open",
    notes: "",
  });

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const submit = () => {
    onCreate(form);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ background: "white", padding: 20, width: 400 }}>
        <h2>New Action Item</h2>

        <input
          placeholder="Submitter ID"
          value={form.submitted_by_user_id}
          onChange={(e) => update("submitted_by_user_id", e.target.value)}
          style={{ width: "100%", marginBottom: 10 }}
        />

        <input
          placeholder="Owner ID"
          value={form.current_owner_user_id}
          onChange={(e) => update("current_owner_user_id", e.target.value)}
          style={{ width: "100%", marginBottom: 10 }}
        />

        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          style={{ width: "100%", marginBottom: 10 }}
        />

        <input
          placeholder="Department"
          value={form.department}
          onChange={(e) => update("department", e.target.value)}
          style={{ width: "100%", marginBottom: 10 }}
        />

        <input
          placeholder="Classification"
          value={form.classification}
          onChange={(e) => update("classification", e.target.value)}
          style={{ width: "100%", marginBottom: 10 }}
        />

        <input
          placeholder="Notes"
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          style={{ width: "100%", marginBottom: 10 }}
        />

        <button onClick={submit} style={{ marginRight: 10 }}>
          Create
        </button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
