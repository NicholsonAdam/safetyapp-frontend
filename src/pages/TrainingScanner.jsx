import React, { useState } from "react";
import Layout from "../components/Layout";

export default function TrainingScanner() {
  const [scannedId, setScannedId] = useState("");
  const [attendees, setAttendees] = useState([]);
  const [sessionName, setSessionName] = useState("");

  const startScanner = () => {
    const scanner = new window.Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: 250 },
      false
    );

    scanner.render(
      (decodedText) => {
        setScannedId(decodedText);
        logAttendance(decodedText);
      },
      (error) => {}
    );
  };

  const logAttendance = async (employeeId) => {
    await fetch("/api/training/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employee_id: employeeId,
        session_name: sessionName
      })
    });

    setAttendees((prev) => [...prev, employeeId]);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
        Training Attendance Scanner
      </h1>

      <input
        type="text"
        placeholder="Training Session Name"
        value={sessionName}
        onChange={(e) => setSessionName(e.target.value)}
        style={{
          padding: "0.8rem",
          fontSize: "1.2rem",
          width: "100%",
          marginBottom: "1.5rem"
        }}
      />

      <button
        onClick={startScanner}
        style={{
          padding: "1rem",
          fontSize: "1.5rem",
          backgroundColor: "#004aad",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          marginBottom: "1.5rem"
        }}
      >
        Start Scanner
      </button>

      <div id="reader" style={{ width: "100%", marginBottom: "2rem" }}></div>

      <h2>Attendees</h2>
      <ul style={{ fontSize: "1.3rem" }}>
        {attendees.map((id, index) => (
          <li key={index}>Employee ID: {id}</li>
        ))}
      </ul>
    </div>
  );
}
