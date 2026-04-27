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
  const [uploadError, setUploadError] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);

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
    setUploadError("");
    setUploadLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("uploaded_by", localStorage.getItem("employee_id"));
      formData.append("change_comment", comment);

      const res = await fetch(`${API}/documentversions/${documentId}`, {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        throw new Error("Failed to upload new version");
      }

      setShowUpload(false);
      setFile(null);
      setComment("");
      loadVersions();
      console.log("Version uploaded successfully");
    } catch (err) {
      console.error(err);
      setUploadError(err.message || "Error uploading version");
    } finally {
      setUploadLoading(false);
    }
  };

  // Open version (view/download)
  const openVersion = async versionId => {
    try {
      // 1. Get version metadata (this returns JSON)
      const res = await fetch(`${API}/documentversions/version/${versionId}`);
      const data = await res.json();

      // 2. Build full file URL
      const fileUrl = `${API}${data.file_path}`;

      // 3. Open the actual file (PDF, Word, Excel, etc.)
      window.open(fileUrl, "_blank");
    } catch (err) {
      console.error("Error opening version:", err);
    }
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

      <h1 style={{ fontSize: "2.2rem", marginBottom: "1rem" }}>
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
              borderRadius: "12px",
              width: "450px",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)"
            }}
          >
            <h2>Upload New Version</h2>

            <input
              type="file"
              onChange={e => setFile(e.target.files[0] || null)}
              style={{ padding: "0.5rem", fontSize: "1rem" }}
            />

            <textarea
              placeholder="Explain the revision"
              value={comment}
              onChange={e => setComment(e.target.value)}
              style={{ padding: "0.5rem", fontSize: "1rem", minHeight: "80px" }}
            />

            {uploadError && (
              <div
                style={{
                  color: "red",
                  fontSize: "0.9rem",
                  marginTop: "0.5rem"
                }}
              >
                {uploadError}
              </div>
            )}

            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                onClick={uploadVersion}
                disabled={uploadLoading || !file || !comment.trim()}
                style={{
                  flex: 1,
                  padding: "0.8rem",
                  backgroundColor: "#004aad",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor:
                    uploadLoading || !file || !comment.trim()
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    uploadLoading || !file || !comment.trim()
                      ? 0.6
                      : 1
                }}
              >
                {uploadLoading ? "Uploading..." : "Upload"}
              </button>

              <button
                onClick={() => {
                  setShowUpload(false);
                  setUploadError("");
                }}
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
            onClick={() => openVersion(v.id)}
            style={{
              padding: "1rem",
              fontSize: "1.2rem",
              backgroundColor: "#004aad",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              textAlign: "left"
            }}
          >
            <div style={{ fontWeight: "600" }}>
              Version {v.version_number} —{" "}
              {new Date(v.uploaded_at).toLocaleString()}
            </div>
            <div style={{ fontSize: "0.9rem", marginTop: "0.25rem" }}>
              Uploaded by: {v.uploaded_by_name || v.uploaded_by}
            </div>
            {v.change_comment && (
              <div
                style={{
                  fontSize: "0.9rem",
                  marginTop: "0.25rem",
                  fontStyle: "italic"
                }}
              >
                “{v.change_comment}”
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
