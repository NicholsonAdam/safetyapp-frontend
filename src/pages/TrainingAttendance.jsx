import React, { useState, useEffect } from "react";
import ReportList from "../components/training/ReportList";
import ReportViewer from "../components/training/ReportViewer";

export default function TrainingAttendance() {
  const backendUrl = "https://safetyapp-backend-docker.onrender.com";

  const [tab, setTab] = useState("PLANT_MEETING"); // default tab
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);

  // Load all reports on mount
  const loadReports = async () => {
    const res = await fetch(`${backendUrl}/api/training/reports`);
    const data = await res.json();
    setReports(data);
  };

  useEffect(() => {
    loadReports();
  }, []);

  // Filter reports by tab
  const filteredReports = reports.filter((r) => r.type === tab);

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "1.5rem" }}>
        Training Attendance Reports
      </h1>

      {/* TABS */}
      <div style={{ display: "flex", marginBottom: "2rem" }}>
        <button
          onClick={() => {
            setTab("PLANT_MEETING");
            setSelectedReport(null);
          }}
          style={{
            padding: "1rem 2rem",
            fontSize: "1.2rem",
            border: "none",
            borderBottom: tab === "PLANT_MEETING" ? "4px solid #004aad" : "4px solid transparent",
            background: "none",
            cursor: "pointer",
            marginRight: "1rem",
          }}
        >
          Plant Meetings
        </button>

        <button
          onClick={() => {
            setTab("TRAINING");
            setSelectedReport(null);
          }}
          style={{
            padding: "1rem 2rem",
            fontSize: "1.2rem",
            border: "none",
            borderBottom: tab === "TRAINING" ? "4px solid #004aad" : "4px solid transparent",
            background: "none",
            cursor: "pointer",
          }}
        >
          Training Sessions
        </button>
      </div>

      {/* LIST OR VIEWER */}
      {!selectedReport && (
        <ReportList
          reports={filteredReports}
          onOpen={(report) => setSelectedReport(report)}
        />
      )}

      {selectedReport && (
        <ReportViewer
          report={selectedReport}
          onBack={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
}
