import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function DocumentView() {
  const { documentId } = useParams();
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL;

  const [versions, setVersions] = useState([]);

  // Upload modal state
  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState(null);
  const [comment, setComment] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);

  // Viewer state
  const [activeFileUrl, setActiveFileUrl] = useState(null);
  const [activeFileType, setActiveFileType] = useState(null);
  const [activeVersion, setActiveVersion] = useState(null);

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

      if (!res.ok) throw new Error("Failed to upload new version");

      setShowUpload(false);
      setFile(null);
      setComment("");
      loadVersions();
    } catch (err) {
      setUploadError(err.message || "Error uploading version");
    } finally {
      setUploadLoading(false);
    }
  };

  // Open version inside the page
  const openVersion = async versionId => {
    try {
      const res = await fetch(`${API}/documentversions/version/${versionId}`);
      const data = await res.json();

      const fileUrl = `${API}${data.file_path}`;
      const fileType = data.file_type;

      setActiveFileUrl(fileUrl);
      setActiveFileType(fileType);
      setActiveVersion(data);
    } catch (err) {
      console.error("Error opening version:", err);
    }
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
          Document Versions
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

      {/* UPLOAD NEW VERSION BUTTON */}
      <button
        onClick={() => setShowUpload(true)}
        style={{
          padding: "10px 16px",
          background: "#B30000",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "600",
          marginBottom: "20px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
        }}
      >
        + Upload New Version
      </button>

      {/* UPLOAD MODAL */}
      {showUpload && (
        <Modal>
          <ModalBox>
            <h2>Upload New Version</h2>

            <input
              type="file"
              onChange={e => setFile(e.target.files[0] || null)}
              style={input}
            />

            <textarea
              placeholder="Explain the revision"
              value={comment}
              onChange={e => setComment(e.target.value)}
              style={textarea}
            />

            {uploadError && (
              <div style={{ color: "red", fontSize: "0.9rem" }}>
                {uploadError}
              </div>
            )}

            <div style={modalRow}>
              <button
                onClick={uploadVersion}
                disabled={uploadLoading || !file || !comment.trim()}
                style={{
                  ...btnPrimary,
                  flex: 1,
                  opacity:
                    uploadLoading || !file || !comment.trim() ? 0.6 : 1,
                  cursor:
                    uploadLoading || !file || !comment.trim()
                      ? "not-allowed"
                      : "pointer"
                }}
              >
                {uploadLoading ? "Uploading..." : "Upload"}
              </button>

              <button
                onClick={() => {
                  setShowUpload(false);
                  setUploadError("");
                }}
                style={{ ...btnCancel, flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </ModalBox>
        </Modal>
      )}

      {/* VERSION LIST */}
      <h2 style={{ marginBottom: "10px" }}>Versions</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {versions.map(v => (
          <div
            key={v.id}
            onClick={() => openVersion(v.id)}
            style={versionCard}
          >
            <div style={{ fontWeight: "600", fontSize: "1.2rem" }}>
              Version {v.version_number} —{" "}
              {new Date(v.uploaded_at).toLocaleString()}
            </div>

            <div style={{ fontSize: "0.9rem", marginTop: "4px" }}>
              Uploaded by: {v.uploaded_by_name || v.uploaded_by}
            </div>

            {v.change_comment && (
              <div
                style={{
                  fontSize: "0.9rem",
                  marginTop: "4px",
                  fontStyle: "italic"
                }}
              >
                “{v.change_comment}”
              </div>
            )}
          </div>
        ))}
      </div>

      {/* INLINE DOCUMENT VIEWER */}
      {activeFileUrl && (
        <div
          style={{
            marginTop: "24px",
            background: "white",
            padding: "16px",
            borderRadius: "8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
          }}
        >
          <h2 style={{ marginBottom: "12px" }}>
            Viewing Version {activeVersion?.version_number}
          </h2>

          {/* PDF VIEWER */}
          {activeFileType === "application/pdf" && (
            <iframe
              src={activeFileUrl}
              style={{
                width: "100%",
                height: "80vh",
                borderRadius: "6px",
                border: "1px solid #ccc"
              }}
            />
          )}

          {/* IMAGE VIEWER */}
          {activeFileType?.startsWith("image/") && (
            <img
              src={activeFileUrl}
              style={{
                maxWidth: "100%",
                maxHeight: "80vh",
                borderRadius: "6px",
                border: "1px solid #ccc"
              }}
            />
          )}

          {/* NON-PREVIEWABLE FILES */}
          {!activeFileType?.startsWith("image/") &&
            activeFileType !== "application/pdf" && (
              <div>
                <p>This file type cannot be previewed. Download instead:</p>
                <a
                  href={activeFileUrl}
                  download
                  style={btnPrimary}
                >
                  Download File
                </a>
              </div>
            )}
        </div>
      )}
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

const btnCancel = {
  padding: "10px 16px",
  background: "#999",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "600"
};

const versionCard = {
  background: "white",
  borderLeft: "6px solid #800000",
  padding: "14px 18px",
  borderRadius: "8px",
  cursor: "pointer",
  boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
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

const textarea = {
  padding: "0.6rem",
  fontSize: "1rem",
  borderRadius: "6px",
  border: "1px solid #ccc",
  minHeight: "80px"
};

const modalRow = {
  display: "flex",
  gap: "1rem",
  marginTop: "0.5rem"
};
