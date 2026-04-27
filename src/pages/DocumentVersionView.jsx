import React, { useEffect, useState, useRef } from "react";
import Layout from "../components/Layout";
import { useParams } from "react-router-dom";

export default function DocumentVersionView() {
  const { versionId } = useParams();
  const [version, setVersion] = useState(null);
  const [signatures, setSignatures] = useState([]);

  const [showSign, setShowSign] = useState(false);
  const [typedName, setTypedName] = useState("");

  const canvasRef = useRef(null);
  const drawing = useRef(false);

  // Load version
  useEffect(() => {
    fetch(`${API}/documentversions/version/${versionId}`)
      .then(res => res.json())
      .then(data => setVersion(data));
  }, [versionId]);

  // Load signatures
  const loadSignatures = () => {
    fetch(`${API}/signatures/${versionId}`)
      .then(res => res.json())
      .then(data => setSignatures(data));
  };

  useEffect(() => {
    loadSignatures();
  }, [versionId]);

  // Canvas drawing
  const startDraw = (e) => {
    drawing.current = true;
    draw(e);
  };

  const endDraw = () => {
    drawing.current = false;
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
  };

  const draw = (e) => {
    if (!drawing.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = "black";

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  // Upload signature
  const submitSignature = async () => {
    const canvas = canvasRef.current;

    const blob = await new Promise(resolve => canvas.toBlob(resolve));

    const formData = new FormData();
    formData.append("signature", blob, "signature.png");
    formData.append("document_id", version.document_id);
    formData.append("document_version_id", versionId);
    formData.append("employee_id", localStorage.getItem("employee_id"));
    formData.append("signed_by", typedName);

    await fetch(`${API}/signatures`, {
      method: "POST",
      body: formData
    });

    setShowSign(false);
    setTypedName("");
    loadSignatures();
  };

  if (!version) {
    return <div style={{ padding: "2rem" }}>Loading...</div>;
  }

  const fileUrl = `${API}${version.file_path}`;

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
        Document Viewer
      </h1>

      {/* VERSION INFO */}
      <div style={{ marginBottom: "1.5rem" }}>
        <p><strong>Version:</strong> {version.version_number}</p>
        <p><strong>Uploaded By:</strong> {version.uploaded_by}</p>
        <p><strong>Uploaded At:</strong> {new Date(version.uploaded_at).toLocaleString()}</p>
        <p><strong>Change Comment:</strong> {version.change_comment || "None"}</p>
      </div>

      {/* VIEWER */}
      <div
        style={{
          width: "100%",
          height: "70vh",
          border: "1px solid #ccc",
          borderRadius: "8px",
          overflow: "hidden",
          marginBottom: "1rem"
        }}
      >
        <embed
          src={fileUrl}
          type="application/pdf"
          width="100%"
          height="100%"
        />
      </div>

      {/* ACTION BUTTONS */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
        <a
          href={fileUrl}
          download
          style={{
            padding: "0.8rem 1.2rem",
            backgroundColor: "#004aad",
            color: "white",
            borderRadius: "6px",
            textDecoration: "none"
          }}
        >
          Download
        </a>

        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: "0.8rem 1.2rem",
            backgroundColor: "#008000",
            color: "white",
            borderRadius: "6px",
            textDecoration: "none"
          }}
        >
          Open in New Tab
        </a>

        <button
          onClick={() => setShowSign(true)}
          style={{
            padding: "0.8rem 1.2rem",
            backgroundColor: "#ffa500",
            color: "black",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer"
          }}
        >
          Sign Document
        </button>
      </div>

      {/* SIGNATURE MODAL */}
      {showSign && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "2rem",
              borderRadius: "10px",
              width: "450px",
              display: "flex",
              flexDirection: "column",
              gap: "1rem"
            }}
          >
            <h2>Sign Document</h2>

            <input
              type="text"
              placeholder="Your Name"
              value={typedName}
              onChange={e => setTypedName(e.target.value)}
              style={{ padding: "0.5rem", fontSize: "1rem" }}
            />

            <canvas
              ref={canvasRef}
              width={400}
              height={200}
              style={{
                border: "1px solid black",
                borderRadius: "6px",
                cursor: "crosshair"
              }}
              onMouseDown={startDraw}
              onMouseUp={endDraw}
              onMouseMove={draw}
            />

            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                onClick={submitSignature}
                style={{
                  flex: 1,
                  padding: "0.8rem",
                  backgroundColor: "#004aad",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                Submit
              </button>

              <button
                onClick={() => setShowSign(false)}
                style={{
                  flex: 1,
                  padding: "0.8rem",
                  backgroundColor: "#999",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SIGNATURE LIST */}
      <h2>Signatures</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {signatures.map(sig => (
          <a
            key={sig.id}
            href={`/${sig.signature_image_path}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "1rem",
              backgroundColor: "#333",
              color: "white",
              borderRadius: "6px",
              textDecoration: "none"
            }}
          >
            {sig.signed_by} — {new Date(sig.signed_at).toLocaleString()}
          </a>
        ))}
      </div>
    </div>
  );
}
