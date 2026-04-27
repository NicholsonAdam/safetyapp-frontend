import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function DocumentView() {
  const { documentId } = useParams();
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL;

  const [versions, setVersions] = useState([]);

  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState(null);
  const [comment, setComment] = useState("");

  // Load versions
  const loadVersions = () => {
    fetch(`${API}/documentversions/${documentId}`)
      .then(res => res.json())
      .then(data => setVersions(data))
      .catch(err => console.error("Error loading versions:", err));
  };

  useEffect(() => {
    loadVersions();
  }, [documentId]);

  // Upload new version
  const uploadVersion = async () => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploaded_by", localStorage.getItem("employee_id"));
    formData.append("change_comment", comment);

    await fetch(`${API}/documentversions/${documentId}`, {
      method: "POST",
      body: formData
    });

    setShowUpload(false);
    setFile(null);
    setComment("");
    loadVersions();
  };

  return (
    <div style={{ padding: "2rem" }}>
      {/* BACK BUTTON */}
      <button
        onClick={() => navigate(-1)}
        style={{
          padding: "0.6rem 1rem",
          backgroundColor: "#e0e0e0",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          marginBottom: "1.5rem",
          fontWeight: "600"
        }}
      >
        ← Back
      </button>

      <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
        Document Versions
      </h1>

      {/* UPLOAD NEW VERSION BUTTON */}
      <button
        onClick={() => setShowUpload(true)}
        style={{
          padding: "0.8rem 1.2rem",
          fontSize: "1.2rem",
          backgroundColor: "#008000",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          marginBottom: "1.5rem"
        }}
      >
        + Upload New Version
      </button>

      {/* UPLOAD MODAL */}
      {showUpload && (
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
          <div
            style={{
              backgroundColor: "white",
              padding: "2rem",
              borderRadius: "10px",
              width: "400px",
              display: "flex",
              flexDirection: "column",
              gap: "1rem"
            }}
          >
            <h2>Upload New Version</h2>

            <input
              type="file"
              onChange={e => setFile(e.target.files[0])}
              style={{ padding: "0.5rem", fontSize: "1rem" }}
            />

            <textarea
              placeholder="Change comment (what changed?)"
              value={comment}
              onChange={e => setComment(e.target.value)}
              style={{ padding: "0.5rem", fontSize: "1rem" }}
            />

            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                onClick={uploadVersion}
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
                Upload
              </button>

              <button
                onClick={() => setShowUpload(false)}
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

      {/* VERSION LIST */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {versions.map(v => (
          <button
            key={v.id}
            onClick={() => navigate(`/documents/version/${v.id}`)}
            style={{
              padding: "1rem",
              fontSize: "1.5rem",
              backgroundColor: "#004aad",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            Version {v.version_number} —{" "}
            {new Date(v.uploaded_at).toLocaleString()}
          </button>
        ))}
      </div>
    </div>
  );
}
