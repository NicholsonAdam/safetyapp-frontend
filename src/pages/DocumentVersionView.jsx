import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function DocumentVersionView() {
  const { versionId } = useParams();
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL;

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
          Document Viewer
        </h1>

        <button
          onClick={() => navigate(-1)}
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
          ← Back
        </button>
      </div>

      {/* VERSION INFO CARD */}
      <div
        style={{
          background: "white",
          padding: "16px",
          borderRadius: "8px",
          marginBottom: "20px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
        }}
      >
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
          borderRadius: "8px",
          overflow: "hidden",
          marginBottom: "20px",
          background: "white",
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
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
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <a
          href={fileUrl}
          download
          style={btnPrimary}
        >
          ⬇ Download
        </a>

        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={btnSecondary}
        >
          Open in New Tab
        </a>

        <button
          onClick={() => setShowSign(true)}
          style={btnOrange}
        >
          ✍️ Sign Document
        </button>
      </div>

      {/* SIGNATURE MODAL */}
      {showSign && (
        <Modal>
          <ModalBox>
            <h2>Sign Document</h2>

            <input
              type="text"
              placeholder="Your Name"
              value={typedName}
              onChange={e => setTypedName(e.target.value)}
              style={input}
            />

            <canvas
              ref={canvasRef}
              width={400}
              height={200}
              style={{
                border: "1px solid #ccc",
                borderRadius: "6px",
                cursor: "crosshair"
              }}
              onMouseDown={startDraw}
              onMouseUp={endDraw}
              onMouseMove={draw}
            />

            <div style={modalRow}>
              <button
                onClick={submitSignature}
                style={{ ...btnPrimary, flex: 1 }}
              >
                Submit
              </button>

              <button
                onClick={() => setShowSign(false)}
                style={{ ...btnCancel, flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </ModalBox>
        </Modal>
      )}

      {/* SIGNATURE LIST */}
      <h2 style={{ marginBottom: "10px" }}>Signatures</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {signatures.map(sig => (
          <a
            key={sig.id}
            href={`/${sig.signature_image_path}`}
            target="_blank"
            rel="noopener noreferrer"
            style={signatureCard}
          >
            ✍️ {sig.signed_by} — {new Date(sig.signed_at).toLocaleString()}
          </a>
        ))}
      </div>
    </div>
  );
}

/* ---------- STYLES ---------- */

const btnPrimary = {
  padding: "10px 16px",
  background: "#B30000",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "600",
  textDecoration: "none",
  boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
};

const btnSecondary = {
  padding: "10px 16px",
  background: "#800000",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "600",
  textDecoration: "none",
  boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
};

const btnOrange = {
  padding: "10px 16px",
  background: "#ffa500",
  color: "black",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "600",
  boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
};

const btnCancel = {
  padding: "10px 16px",
  background: "#999",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "600"
};

const signatureCard = {
  background: "white",
  borderLeft: "6px solid #B30000",
  padding: "14px 18px",
  borderRadius: "8px",
  cursor: "pointer",
  boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
  fontSize: "1.1rem",
  fontWeight: "600",
  color: "#333",
  textDecoration: "none"
};

const Modal = ({ children }) => (
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
      alignItems: "center",
      zIndex: 99999
    }}
  >
    {children}
  </div>
);

const ModalBox = ({ children }) => (
  <div
    style={{
      background: "white",
      padding: "24px",
      borderRadius: "12px",
      width: "450px",
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
      boxShadow: "0 10px 30px rgba(0,0,0,0.25)"
    }}
  >
    {children}
  </div>
);

const input = {
  padding: "0.6rem",
  fontSize: "1rem",
  borderRadius: "6px",
  border: "1px solid #ccc"
};

const modalRow = {
  display: "flex",
  gap: "1rem",
  marginTop: "0.5rem"
};
