import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReportList from "../components/training/ReportList";
import ReportViewer from "../components/training/ReportViewer";

export default function TrainingAttendance() {
  const backendUrl = "https://safetyapp-backend-docker.onrender.com";
  const navigate = useNavigate();

  const [tab, setTab] = useState("PLANT_MEETING");
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);

  const loadReports = async () => {
    const res = await fetch(`${backendUrl}/api/training/reports`);
    const data = await res.json();
    setReports(data);
  };

  useEffect(() => {
    loadReports();
  }, []);

  const filteredReports = reports.filter((r) => r.type === tab);

  return (
    <div style={{ padding: "24px", maxWidth: "1300px", margin: "0 auto" }}>
      {/* HEADER BAR */}
      <div
        style={{
          background: "#333333",
          padding: "16px 20px",
          borderRadius: "8px",
          marginBottom: "24px",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 3px 8px rgba(0,0,0,0.25)"
        }}
      >
        <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "600" }}>
          Training Attendance Reports
        </h1>

        <button
          onClick={() => navigate("/leaderwalk")}
          style={{
            padding: "8px 14px",
            background: "#B30000",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600"
          }}
        >
          ← Back to Tools
        </button>
      </div>

      {/* TABS */}
      <div
        style={{
          background: "white",
          padding: "16px",
          borderRadius: "8px",
          marginBottom: "20px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          display: "flex",
          gap: "20px"
        }}
      >
        <button
          onClick={() => {
            setTab("PLANT_MEETING");
            setSelectedReport(null);
          }}
          style={{
            padding: "10px 16px",
            fontSize: "1.1rem",
            background: "none",
            border: "none",
            borderBottom:
              tab === "PLANT_MEETING"
                ? "4px solid #B30000"
                : "4px solid transparent",
            cursor: "pointer",
            fontWeight: "600",
            color: tab === "PLANT_MEETING" ? "#B30000" : "#555"
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
            padding: "10px 16px",
            fontSize: "1.1rem",
            background: "none",
            border: "none",
            borderBottom:
              tab === "TRAINING"
                ? "4px solid #B30000"
                : "4px solid transparent",
            cursor: "pointer",
            fontWeight: "600",
            color: tab === "TRAINING" ? "#B30000" : "#555"
          }}
        >
          Training Sessions
        </button>
      </div>

      {/* LIST OR VIEWER */}
      {!selectedReport && (
        <div
          style={{
            background: "white",
            padding: "16px",
            borderRadius: "8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
          }}
        >
          <ReportList
            reports={filteredReports}
            onOpen={(report) => setSelectedReport(report)}
          />
        </div>
      )}

      {selectedReport && (
        <div
          style={{
            background: "white",
            padding: "16px",
            borderRadius: "8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
          }}
        >
          <ReportViewer
            report={selectedReport}
            onBack={() => setSelectedReport(null)}
          />
        </div>
      )}
    </div>
  );
}
