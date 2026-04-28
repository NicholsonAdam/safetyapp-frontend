import React, { useState, useEffect } from "react";

export default function TrainingScanner() {
  const backendUrl = "https://safetyapp-backend-docker.onrender.com";

  const [sessionName, setSessionName] = useState("");
  const [sessionType, setSessionType] = useState("TRAINING");
  const [trainingTitle, setTrainingTitle] = useState("");
  const [trainerName, setTrainerName] = useState("");

  const [openSessions, setOpenSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);

  const [scannedId, setScannedId] = useState("");
  const [attendees, setAttendees] = useState([]);

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
        employee_id: "9999", // TEMP — replace with real auth later
      },
      body: JSON.stringify(body),
    });

    const newSession = await res.json();
    setActiveSession(newSession);
  };

  // Join an existing session
  const joinSession = (session) => {
    setActiveSession(session);
  };

  // Start QR scanner
  const startScanner = () => {
    const scanner = new window.Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: 250 },
      false
    );

    scanner.render(
      (decodedText) => {
        setScannedId(decodedText);
        logScan(decodedText, "CAMERA");
      },
      () => {}
    );
  };

  // Log a scan
  const logScan = async (employeeId, source) => {
    if (!activeSession) return;

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
  };

  // Close session
  const closeSession = async () => {
    const res = await fetch(
      `${backendUrl}/api/training/sessions/${activeSession.id}/close`,
      {
        method: "POST",
        headers: { employee_id: "9999" },
      }
    );

    const data = await res.json();
    alert("Session closed and report created.");
    setActiveSession(null);
    setAttendees([]);
    loadOpenSessions();
  };

  return (
      <div style={{ padding: "2rem" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
          Training Attendance Scanner
        </h1>

        {/* If no active session, show session creation + open sessions */}
        {!activeSession && (
          <>
            <h2>Create New Session</h2>

            <input
              type="text"
              placeholder="Session Name"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              style={{
                padding: "0.8rem",
                fontSize: "1.2rem",
                width: "100%",
                marginBottom: "1rem",
              }}
            />

            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
              style={{
                padding: "0.8rem",
                fontSize: "1.2rem",
                width: "100%",
                marginBottom: "1rem",
              }}
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
                  style={{
                    padding: "0.8rem",
                    fontSize: "1.2rem",
                    width: "100%",
                    marginBottom: "1rem",
                  }}
                />

                <input
                  type="text"
                  placeholder="Trainer Name"
                  value={trainerName}
                  onChange={(e) => setTrainerName(e.target.value)}
                  style={{
                    padding: "0.8rem",
                    fontSize: "1.2rem",
                    width: "100%",
                    marginBottom: "1rem",
                  }}
                />
              </>
            )}

            <button
              onClick={startSession}
              style={{
                padding: "1rem",
                fontSize: "1.5rem",
                backgroundColor: "#004aad",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                marginBottom: "2rem",
              }}
            >
              Start New Session
            </button>

            <h2>Open Sessions</h2>
            {openSessions.length === 0 && <p>No open sessions.</p>}

            <ul>
              {openSessions.map((s) => (
                <li key={s.id} style={{ marginBottom: "1rem" }}>
                  <strong>{s.name}</strong> — {s.type}
                  <button
                    onClick={() => joinSession(s)}
                    style={{
                      marginLeft: "1rem",
                      padding: "0.5rem 1rem",
                      backgroundColor: "#008000",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    Join
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {/* Active session UI */}
        {activeSession && (
          <>
            <h2>Active Session: {activeSession.name}</h2>

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
                marginBottom: "1.5rem",
              }}
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
              style={{
                padding: "0.8rem",
                fontSize: "1.2rem",
                width: "100%",
                marginBottom: "1rem",
              }}
            />
            <button
              onClick={() => logScan(scannedId, "MANUAL")}
              style={{
                padding: "0.8rem",
                fontSize: "1.2rem",
                backgroundColor: "#555",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                marginBottom: "2rem",
              }}
            >
              Submit Manual Entry
            </button>

            <h3>Attendees</h3>
            <ul style={{ fontSize: "1.3rem" }}>
              {attendees.map((id, index) => (
                <li key={index}>Employee ID: {id}</li>
              ))}
            </ul>

            <button
              onClick={closeSession}
              style={{
                padding: "1rem",
                fontSize: "1.5rem",
                backgroundColor: "red",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                marginTop: "2rem",
              }}
            >
              Close Session
            </button>
          </>
        )}
      </div>
  );
}
