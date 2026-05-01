import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function TrainingScanner() {
  const backendUrl = "https://safetyapp-backend-docker.onrender.com";
  const navigate = useNavigate();

  const [sessionName, setSessionName] = useState("");
  const [sessionType, setSessionType] = useState("TRAINING");
  const [trainingTitle, setTrainingTitle] = useState("");
  const [trainerName, setTrainerName] = useState("");

  const [openSessions, setOpenSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);

  const [scannedId, setScannedId] = useState("");
  const [attendees, setAttendees] = useState([]);

  const [scanFlash, setScanFlash] = useState(false);
  const [scanLocked, setScanLocked] = useState(false);

  // Load open sessions
  const loadOpenSessions = async () => {
    const res = await fetch(`${backendUrl}/api/training/sessions/open`);
    const data = await res.json();
    setOpenSessions(data);
  };

  useEffect(() => {
    loadOpenSessions();
  }, []);

  // Start a new session
  const startSession = async () => {
    const body = {
      name: sessionName,
      type: sessionType,
      training_title: sessionType === "TRAINING" ? trainingTitle : null,
      trainer_name: sessionType === "TRAINING" ? trainerName : null,
    };

    const res = await fetch(`${backendUrl}/api/training/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        employee_id: "9999",
      },
      body: JSON.stringify(body),
    });

    const newSession = await res.json();
    setActiveSession(newSession);
    loadOpenSessions();
  };

  // Join an existing session
  const joinSession = (session) => {
    setActiveSession(session);
    loadOpenSessions();
  };

  // Start QR scanner
  const startScanner = () => {
    const scanner = new window.Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: 300,
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        }
      },
      false
    );

    scanner.render(
      (decodedText) => {
        if (scanLocked) return;
        setScanLocked(true);

        if (attendees.includes(decodedText)) {
          setTimeout(() => setScanLocked(false), 3000);
          return;
        }

        setScanFlash(true);

        setTimeout(() => {
          setScanFlash(false);
          setScanLocked(false);
        }, 3000);

        setScannedId(decodedText);
        logScan(decodedText, "CAMERA");
      },
      () => {}
    );
  };

  // Log a scan
  const logScan = async (employeeId, source) => {
    if (!activeSession) return;

    if (attendees.includes(employeeId)) return;

    await fetch(`${backendUrl}/api/training/sessions/${activeSession.id}/scan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        employee_id: "9999",
      },
      body: JSON.stringify({
        attendance_session_id: activeSession.id,
        employee_id: employeeId,
        source,
      }),
    });

    setAttendees((prev) => [...prev, employeeId]);
    setScannedId("");
  };

  // Close session
  const closeSession = async () => {
    await fetch(
      `${backendUrl}/api/training/sessions/${activeSession.id}/close`,
      {
        method: "POST",
        headers: { employee_id: "9999" },
      }
    );

    alert("Session closed and report created.");
    setActiveSession(null);
    setAttendees([]);
    loadOpenSessions();
  };

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
          Training Attendance Scanner
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

      {/* SUCCESS FLASH */}
      {scanFlash && (
        <div
          style={{
            width: "100%",
            padding: "1rem",
            backgroundColor: "#4caf50",
            color: "white",
            textAlign: "center",
            fontSize: "1.5rem",
            fontWeight: "bold",
            borderRadius: "8px",
            marginBottom: "1.5rem",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
          }}
        >
          ✓ Scan Recorded
        </div>
      )}

      {/* If no active session */}
      {!activeSession && (
        <div
          style={{
            background: "white",
            padding: "16px",
            borderRadius: "8px",
            marginBottom: "20px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
          }}
        >
          <h2>Create New Session</h2>

          <input
            type="text"
            placeholder="Session Name"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            style={input}
          />

          <select
            value={sessionType}
            onChange={(e) => setSessionType(e.target.value)}
            style={input}
          >
            <option value="PLANT_MEETING">Plant Meeting</option>
            <option value="TRAINING">Training Session</option>
          </select>

          {sessionType === "TRAINING" && (
            <>
              <input
                type="text"
                placeholder="Training Title"
                value={trainingTitle}
                onChange={(e) => setTrainingTitle(e.target.value)}
                style={input}
              />

              <input
                type="text"
                placeholder="Trainer Name"
                value={trainerName}
                onChange={(e) => setTrainerName(e.target.value)}
                style={input}
              />
            </>
          )}

          <button
            onClick={startSession}
            style={btnPrimary}
          >
            Start New Session
          </button>

          <h2 style={{ marginTop: "20px" }}>Open Sessions</h2>

          {openSessions.length === 0 && <p>No open sessions.</p>}

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {openSessions.map((s) => (
              <div
                key={s.id}
                style={sessionCard}
              >
                <div>
                  <strong>{s.name}</strong> — {s.type}
                </div>

                <button
                  onClick={() => joinSession(s)}
                  style={btnSecondary}
                >
                  Join
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active session UI */}
      {activeSession && (
        <div
          style={{
            background: "white",
            padding: "16px",
            borderRadius: "8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
          }}
        >
          <h2>Active Session: {activeSession.name}</h2>

          <button
            onClick={startScanner}
            style={btnPrimary}
          >
            Start Scanner
          </button>

          <div id="reader" style={{ width: "100%", marginBottom: "2rem" }}></div>

          <h3>Manual Entry</h3>

          <input
            type="text"
            placeholder="Employee ID"
            value={scannedId}
            onChange={(e) => setScannedId(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") logScan(scannedId, "MANUAL");
            }}
            style={input}
          />

          <button
            onClick={() => logScan(scannedId, "MANUAL")}
            style={btnGray}
          >
            Submit Manual Entry
          </button>

          <h3>Attendees</h3>

          <ul style={{ fontSize: "1.2rem", paddingLeft: "20px" }}>
            {attendees.map((id, index) => (
              <li key={index}>Employee ID: {id}</li>
            ))}
          </ul>

          <button
            onClick={closeSession}
            style={btnDanger}
          >
            Close Session
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- STYLES ---------- */

const input = {
  padding: "0.8rem",
  fontSize: "1.2rem",
  width: "100%",
  marginBottom: "1rem",
  borderRadius: "6px",
  border: "1px solid #ccc"
};

const btnPrimary = {
  padding: "1rem",
  fontSize: "1.3rem",
  backgroundColor: "#B30000",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600",
  marginBottom: "1.5rem",
  boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
};

const btnSecondary = {
  padding: "0.6rem 1rem",
  backgroundColor: "#800000",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "600"
};

const btnGray = {
  padding: "0.8rem",
  fontSize: "1.2rem",
  backgroundColor: "#555",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  marginBottom: "2rem"
};

const btnDanger = {
  padding: "1rem",
  fontSize: "1.3rem",
  backgroundColor: "red",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  marginTop: "2rem",
  fontWeight: "600"
};

const sessionCard = {
  background: "white",
  borderLeft: "6px solid #B30000",
  padding: "14px 18px",
  borderRadius: "8px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
};
