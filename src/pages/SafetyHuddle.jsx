import Layout from "../components/Layout";
import { useEffect, useState } from "react";

export default function SafetyHuddle() {
  const employee = JSON.parse(localStorage.getItem("employee"));

  const [huddles, setHuddles] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [pdfUrl, setPdfUrl] = useState("");

  // Determine current week of the year
  const currentWeek = Math.ceil(
    (new Date() - new Date(new Date().getFullYear(), 0, 1)) / 604800000
  );

  // Load list of huddles from backend
  useEffect(() => {
    fetch("https://safetyapp-backend-xq88.onrender.com/api/huddles")
      .then((res) => res.json())
      .then((data) => {
        setHuddles(data);

        // Auto-select current week if available
        const match = data.find((h) => h.week === currentWeek);
        const defaultWeek = match ? currentWeek : data[0]?.week;

        setSelectedWeek(defaultWeek);
        loadHuddle(defaultWeek, data);
      });
  }, []);

  const loadHuddle = (week, list) => {
    const huddle = list.find((h) => h.week === week);
    if (huddle) {
      setPdfUrl(huddle.pdf_url);
    }
  };

  const handleSign = async () => {
    const res = await fetch("https://safetyapp-backend-xq88.onrender.com/api/huddles/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employee_id: employee.id,
        employee_name: employee.name,
        week: selectedWeek,
        year: new Date().getFullYear(),
      }),
    });

    const data = await res.json();
    alert("Huddle signed successfully!");
  };

  return (
    <Layout>
      <h1 style={{ color: "#b30000", marginBottom: "1rem" }}>
        Weekly Safety Huddle
      </h1>

      {/* WEEK SELECTOR */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          flexWrap: "wrap",
          marginBottom: "1rem",
        }}
      >
        {huddles.map((h) => (
          <button
            key={h.week}
            onClick={() => {
              setSelectedWeek(h.week);
              loadHuddle(h.week, huddles);
            }}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              border: "2px solid #b30000",
              backgroundColor:
                h.week === selectedWeek
                  ? "#b30000"
                  : h.week === currentWeek
                  ? "#ffd6d6"
                  : "white",
              color: h.week === selectedWeek ? "white" : "#b30000",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Week {h.week}
          </button>
        ))}
      </div>

      {/* DOCUMENT VIEWER */}
      <div
        style={{
          width: "100%",
          height: "600px",
          border: "2px solid #b30000",
          borderRadius: "8px",
          overflow: "hidden",
          marginBottom: "1rem",
          backgroundColor: "white",
        }}
      >
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            style={{ width: "100%", height: "100%", border: "none" }}
            title="Safety Huddle PDF"
          />
        ) : (
          <p>Loading document...</p>
        )}
      </div>

      {/* SIGN BUTTON */}
      <button
        onClick={handleSign}
        style={{
          padding: "0.8rem 1.2rem",
          backgroundColor: "#b30000",
          color: "white",
          border: "none",
          borderRadius: "6px",
          fontSize: "1.1rem",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        I Have Reviewed This Huddle
      </button>
    </Layout>
  );
}