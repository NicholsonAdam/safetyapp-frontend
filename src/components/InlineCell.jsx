import { useState } from "react";

export default function InlineCell({ value, rowId, field, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");

  const commit = () => {
    setEditing(false);
    if (draft !== value) {
      onSave(rowId, field, draft);
    }
  };

  return editing ? (
    <input
      autoFocus
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === "Enter" && commit()}
      style={{ width: "100%" }}
    />
  ) : (
    <div onClick={() => setEditing(true)} style={{ cursor: "pointer" }}>
      {value}
    </div>
  );
}
