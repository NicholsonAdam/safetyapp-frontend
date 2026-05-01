import { useState, useEffect, useRef } from "react";

export default function EmployeeAutocomplete({ value, onSelect }) {
  const [query, setQuery] = useState("");
  const [employees, setEmployees] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // ---------------------------------------------------------
  // LOAD ALL EMPLOYEES ONCE
  // ---------------------------------------------------------
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/employees`);
        const data = await res.json();
        setEmployees(data);
      } catch (err) {
        console.error("Failed to load employees:", err);
      }
    };
    loadEmployees();
  }, []);

  // ---------------------------------------------------------
  // RESOLVE ID → NAME WHENEVER employees OR value CHANGE
  // ---------------------------------------------------------
  useEffect(() => {
    if (!value || typeof value !== "number") return;

    const emp = employees.find((e) => e.employee_id === value);
    if (emp) {
      setQuery(emp.name);   // <-- THIS IS THE FIX
    }
  }, [value, employees]);   // <-- THIS is what was missing

  // ---------------------------------------------------------
  // FILTER EMPLOYEES WHEN TYPING
  // ---------------------------------------------------------
  useEffect(() => {
    if (!query) {
      setFiltered([]);
      return;
    }

    const q = query.toLowerCase();
    setFiltered(
      employees.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          String(e.employee_id).includes(q)
      )
    );
  }, [query, employees]);

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

      {open && filtered.length > 0 && (
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
          {filtered.map((emp) => (
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
