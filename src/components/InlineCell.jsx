import { useState, useEffect } from "react";

export default function InlineCell({ value, rowId, field, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");

  useEffect(() => {
    setDraft(value ?? "");
  }, [value]);

  const commit = () => {
    setEditing(false);

    const cleaned = String(draft ?? "").trim();
    const original = String(value ?? "");

    if (cleaned !== original) {
      onSave(rowId, field, cleaned);
    }
  };

  return editing ? (
    <input
      autoFocus
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === "Enter" && commit()}
      style={{
        width: "100%",
        padding: "6px",
        borderRadius: "4px",
        border: "1px solid #C4C4C4",
        background: "#FFFFFF",
        fontSize: "14px",
      }}
    />
  ) : (
    <div
      onClick={() => setEditing(true)}
      style={{
        cursor: "pointer",
        padding: "4px 2px",
        minHeight: "20px",
        color: "#333",
      }}
    >
      {value}
    </div>
  );
}
