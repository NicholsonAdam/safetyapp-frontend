import { useState } from "react";

export default function useReportData() {
  const backendUrl = "https://safetyapp-backend-docker.onrender.com";

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load a specific report
  const loadReport = async (reportId) => {
    setLoading(true);

    try {
      const res = await fetch(`${backendUrl}/api/training/reports/${reportId}`);
      const data = await res.json();

      // Normalize rows depending on report type
      if (data.report.type === "PLANT_MEETING") {
        setRows(
          data.rows.map((r) => ({
            employee_id: r.employee_id,
            name: r.name,
            attended: r.attended,
          }))
        );
      } else {
        setRows(
          data.rows.map((r) => ({
            employee_id: r.employee_id,
            name: r.name,
            scanned_at: r.scanned_at,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to load report:", err);
    }

    setLoading(false);
  };

  return {
    rows,
    loading,
    loadReport,
  };
}
