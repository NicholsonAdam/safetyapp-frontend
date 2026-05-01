import { useState, useEffect, useRef } from "react";

export default function EmployeeAutocomplete({ value, onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Detect multi-select mode
  const isMulti = Array.isArray(value);

  // For single-select: show ID if no query yet
  const inputValue = isMulti
    ? query
    : query !== ""
    ? query
    : value
    ? String(value)
    : "";

  // Fetch employees
  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const fetchEmployees = async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/employees?search=${encodeURIComponent(
          query
        )}`
      );
      const data = await res.json();
      setResults(data);
    };

    const delay = setTimeout(fetchEmployees, 200);
    return () => clearTimeout(delay);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Multi-select chip removal
  const removeChip = (id) => {
    const updated = value.filter((v) => v !== id);
    onSelect(updated);
  };

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      {/* MULTI-SELECT CHIPS */}
      {isMulti && value.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "6px",
            marginBottom: "6px",
          }}
        >
          {value.map((id) => (
            <div
              key={id}
              style={{
                background: "#B30000",
                color: "white",
                padding: "4px 8px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                fontWeight: "600",
              }}
            >
              ID {id}
              <span
                style={{
                  cursor: "pointer",
                  fontWeight: "900",
                }}
                onClick={() => removeChip(id)}
              >
                ×
              </span>
            </div>
          ))}
        </div>
      )}

      {/* INPUT */}
      <input
        value={inputValue}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        placeholder="Type owner name..."
        style={{
          width: "100%",
          padding: "8px",
          borderRadius: "6px",
          border: "1px solid #C4C4C4",
          background: "#F5F5F5",
        }}
      />

      {/* DROPDOWN */}
      {open && results.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "42px",
            left: 0,
            width: "100%",
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "6px",
            maxHeight: "200px",
            overflowY: "auto",
            zIndex: 9999,
          }}
        >
          {results.map((emp) => (
            <div
              key={emp.employee_id}
              onClick={() => {
                if (isMulti) {
                  if (!value.includes(emp.employee_id)) {
                    onSelect([...value, emp.employee_id]);
                  }
                  setQuery("");
                } else {
                  onSelect(emp);
                  setQuery(emp.name);
                }
                setOpen(false);
              }}
              style={{
                padding: "8px",
                cursor: "pointer",
                borderBottom: "1px solid #eee",
              }}
            >
              {emp.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
