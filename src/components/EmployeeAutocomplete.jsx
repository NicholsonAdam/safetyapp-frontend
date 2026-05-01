import { useState, useEffect, useRef } from "react";

export default function EmployeeAutocomplete({ value, onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // ---------------------------------------------------------
  // LOAD EMPLOYEE NAME WHEN value IS AN ID (TABLE DISPLAY)
  // ---------------------------------------------------------
  useEffect(() => {
    const loadName = async () => {
      if (!value || typeof value !== "number") return;

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/employees/${value}`
        );

        if (!res.ok) return;

        const data = await res.json();
        if (data && data.name) {
          setQuery(data.name); // <-- SHOW NAME IN TABLE
        }
      } catch (err) {
        console.error("Employee lookup failed:", err);
      }
    };

    loadName();
  }, [value]);

  // ---------------------------------------------------------
  // SEARCH EMPLOYEES
  // ---------------------------------------------------------
  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const fetchEmployees = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/employees?search=${encodeURIComponent(
            query
          )}`
        );

        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          setResults([]);
          return;
        }

        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } catch {
        setResults([]);
      }
    };

    const delay = setTimeout(fetchEmployees, 200);
    return () => clearTimeout(delay);
  }, [query]);

  // ---------------------------------------------------------
  // CLOSE DROPDOWN ON OUTSIDE CLICK
  // ---------------------------------------------------------
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
        style={{
          width: "100%",
          padding: "8px",
          borderRadius: "6px",
          border: "1px solid #C4C4C4",
          background: "#F5F5F5",
        }}
      />

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
                onSelect(emp); // <-- PASS FULL EMPLOYEE OBJECT
                setQuery(emp.name); // <-- SHOW NAME IN INPUT
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
