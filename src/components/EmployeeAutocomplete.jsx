import { useState, useEffect, useRef } from "react";

export default function EmployeeAutocomplete({ value, onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const fetchEmployees = async () => {
      const res = await fetch(`/api/employees?search=${query}`);
      const data = await res.json();
      setResults(data);
    };

    const delay = setTimeout(fetchEmployees, 200);
    return () => clearTimeout(delay);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        placeholder="Type owner name..."
        style={{ width: "100%", padding: 8 }}
      />

      {open && results.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "38px",
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
                onSelect(emp);
                setQuery(emp.name);
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
