import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function DocumentFolderView() {
  const { folderId } = useParams();
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL;

  // DOCUMENTS + SUBFOLDERS
  const [documents, setDocuments] = useState([]);
  const [subfolders, setSubfolders] = useState([]);
  const [allFolders, setAllFolders] = useState([]);

  // BREADCRUMBS
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  // UPLOAD DOCUMENT (NEW DOCUMENT + VERSION 1)
  const [showUploadDoc, setShowUploadDoc] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocDescription, setNewDocDescription] = useState("");
  const [newDocFile, setNewDocFile] = useState(null);
  const [newDocComment, setNewDocComment] = useState("Initial Upload");
  const [uploadDocError, setUploadDocError] = useState("");
  const [uploadDocLoading, setUploadDocLoading] = useState(false);

    // CREATE SUBFOLDER
  const [showCreateSubfolder, setShowCreateSubfolder] = useState(false);
  const [newSubfolderName, setNewSubfolderName] = useState("");
  const [createSubfolderError, setCreateSubfolderError] = useState("");

  // EDIT DOCUMENT (metadata only – rename/move)
  const [showEdit, setShowEdit] = useState(false);
  const [editDoc, setEditDoc] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editFolder, setEditFolder] = useState("");

  // LOAD DOCUMENTS
  const loadDocuments = () => {
    fetch(`${API}/documents?folder_id=${folderId}`)
      .then(res => res.json())
      .then(data => setDocuments(data))
      .catch(err => console.error("Error loading documents:", err));
  };

  // LOAD SUBFOLDERS
  const loadSubfolders = () => {
    fetch(`${API}/folders`)
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter(f => f.parent_folder_id == folderId);
        setSubfolders(filtered);
      })
      .catch(err => console.error("Error loading subfolders:", err));
  };

  // LOAD ALL FOLDERS
  const loadAllFolders = () => {
    fetch(`${API}/folders`)
      .then(res => res.json())
      .then(data => setAllFolders(data))
      .catch(err => console.error("Error loading all folders:", err));
  };

  // BUILD BREADCRUMBS
  const buildBreadcrumbs = (folderId, all) => {
    let chain = [];
    let current = all.find(f => f.id == folderId);

    while (current) {
      chain.unshift(current);
      current = all.find(f => f.id == current.parent_folder_id);
    }

    setBreadcrumbs(chain);
  };

  useEffect(() => {
    loadDocuments();
    loadSubfolders();
    loadAllFolders();
  }, [folderId]);

  useEffect(() => {
    if (allFolders.length > 0) {
      buildBreadcrumbs(folderId, allFolders);
    }
  }, [allFolders, folderId]);

  // CREATE DOCUMENT (metadata only)
  const createDocumentMetadata = async () => {
    const res = await fetch(`${API}/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        folder_id: folderId,
        title: newDocTitle,
        description: newDocDescription,
        created_by: Number(localStorage.getItem("employee_id"))
      })
    });

    if (!res.ok) {
      throw new Error("Failed to create document metadata");
    }

    const doc = await res.json();
    return doc;
  };

  // UPLOAD VERSION 1 FOR NEW DOCUMENT
  const uploadInitialVersion = async documentId => {
    const formData = new FormData();
    formData.append("file", newDocFile);
    formData.append("uploaded_by", localStorage.getItem("employee_id"));
    formData.append("change_comment", newDocComment || "Initial Upload");

    const res = await fetch(`${API}/documentversions/${documentId}`, {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      throw new Error("Failed to upload initial version");
    }
  };

  // HANDLE NEW DOCUMENT UPLOAD
  const handleUploadDocument = async () => {
    setUploadDocError("");
    setUploadDocLoading(true);

    try {
      // Step 1: create document metadata
      const doc = await createDocumentMetadata();

      // Step 2: upload version 1
      await uploadInitialVersion(doc.id);

      // Reset modal state
      setShowUploadDoc(false);
      setNewDocTitle("");
      setNewDocDescription("");
      setNewDocFile(null);
      setNewDocComment("Initial Upload");

      // Reload documents
      loadDocuments();

      // Optional: toast could be added here
      console.log("Document uploaded successfully");
    } catch (err) {
      console.error(err);
      setUploadDocError(err.message || "Error uploading document");
    } finally {
      setUploadDocLoading(false);
    }
  };

  // UPDATE DOCUMENT (metadata only – rename/move)
  const updateDocument = async () => {
    await fetch(`${API}/documents/${editDoc.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle,
        description: editDescription,
        folder_id: editFolder
      })
    });

    setShowEdit(false);
    loadDocuments();
    loadSubfolders();
  };

  // HELPER: get file extension from filename
  const getFileExtension = filename => {
    if (!filename) return "";
    const parts = filename.split(".");
    if (parts.length < 2) return "";
    return parts[parts.length - 1].toLowerCase();
  };

  return (
    <div style={{ padding: "2rem" }}>
      {/* BACK BUTTON */}
      <button
        onClick={() => navigate("/documents")}
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
        ← Back to Document Library
      </button>

      {/* BREADCRUMBS */}
      <h1 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>
        <span
          style={{ cursor: "pointer", color: "#004aad", fontWeight: "600" }}
          onClick={() => navigate("/documents")}
        >
          Document Library
        </span>

        {breadcrumbs.map((folder, index) => (
          <span key={folder.id}>
            {" > "}
            <span
              style={{
                cursor:
                  index === breadcrumbs.length - 1 ? "pointer" : "pointer",
                color:
                  index === breadcrumbs.length - 1 ? "black" : "#004aad",
                fontWeight:
                  index === breadcrumbs.length - 1 ? "600" : "500"
              }}
              onClick={() =>
                index === breadcrumbs.length - 1
                  ? navigate(`/documents/folder/${folder.id}`)
                  : navigate(`/documents/folder/${folder.id}`)
              }
            >
              {folder.name}
            </span>
          </span>
        ))}
      </h1>

      {/* ACTION BUTTONS */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
        <button
          onClick={() => setShowUploadDoc(true)}
          style={{
            padding: "0.8rem 1.2rem",
            fontSize: "1.2rem",
            backgroundColor: "#008000",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          + Upload Document
        </button>

        <button
          onClick={() => setShowCreateSubfolder(true)}
          style={{
            padding: "0.8rem 1.2rem",
            fontSize: "1.2rem",
            backgroundColor: "#ffa500",
            color: "black",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          + Create Subfolder
        </button>

        <button
          onClick={() => navigate("/documents")}
          style={{
            padding: "0.8rem 1.2rem",
            fontSize: "1.2rem",
            backgroundColor: "#004aad",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Back to Library
        </button>
      </div>

      {/* UPLOAD DOCUMENT MODAL */}
      {showUploadDoc && (
        <div style={modalOverlay}>
          <div style={modalBoxModern}>
            <h2 style={{ marginBottom: "0.5rem" }}>Upload Document</h2>
            <p style={{ marginTop: 0, color: "#555", fontSize: "0.9rem" }}>
              Create a new controlled document and upload its initial version.
            </p>

            <input
              type="text"
              placeholder="Document Title (required)"
              value={newDocTitle}
              onChange={e => setNewDocTitle(e.target.value)}
              style={inputStyle}
            />

            <textarea
              placeholder="Description (optional)"
              value={newDocDescription}
              onChange={e => setNewDocDescription(e.target.value)}
              style={textareaStyle}
            />

            <input
              type="file"
              onChange={e => setNewDocFile(e.target.files[0] || null)}
              style={inputStyle}
            />

            <textarea
              placeholder='Explain the revision (default: "Initial Upload")'
              value={newDocComment}
              onChange={e => setNewDocComment(e.target.value)}
              style={textareaStyle}
            />

            {uploadDocError && (
              <div
                style={{
                  color: "red",
                  fontSize: "0.9rem",
                  marginTop: "0.5rem"
                }}
              >
                {uploadDocError}
              </div>
            )}

            <div style={modalButtonRow}>
              <button
                onClick={handleUploadDocument}
                disabled={
                  uploadDocLoading || !newDocTitle.trim() || !newDocFile
                }
                style={{
                  ...primaryButton,
                  opacity:
                    uploadDocLoading || !newDocTitle.trim() || !newDocFile
                      ? 0.6
                      : 1,
                  cursor:
                    uploadDocLoading || !newDocTitle.trim() || !newDocFile
                      ? "not-allowed"
                      : "pointer"
                }}
              >
                {uploadDocLoading ? "Uploading..." : "Upload"}
              </button>
              <button
                onClick={() => {
                  setShowUploadDoc(false);
                  setUploadDocError("");
                }}
                style={cancelButton}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE SUBFOLDER MODAL */}
      {showCreateSubfolder && (
        <div style={modalOverlay}>
          <div style={modalBoxModern}>
            <h2>Create Subfolder</h2>

            <input
              type="text"
              placeholder="Subfolder Name"
              value={newSubfolderName}
              onChange={e => setNewSubfolderName(e.target.value)}
              style={inputStyle}
            />

            {createSubfolderError && (
              <div style={{ color: "red", fontSize: "0.9rem" }}>
                {createSubfolderError}
              </div>
            )}

            <div style={modalButtonRow}>
              <button
                onClick={async () => {
                  setCreateSubfolderError("");

                  if (!newSubfolderName.trim()) {
                    setCreateSubfolderError("Folder name is required");
                    return;
                  }

                  try {
                    const res = await fetch(`${API}/folders`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        name: newSubfolderName,
                        parent_folder_id: folderId
                      })
                    });

                    if (!res.ok) throw new Error("Failed to create subfolder");

                    setShowCreateSubfolder(false);
                    setNewSubfolderName("");
                    loadSubfolders();
                  } catch (err) {
                    setCreateSubfolderError(err.message);
                  }
                }}
                style={primaryButton}
              >
                Create
              </button>

              <button
                onClick={() => {
                  setShowCreateSubfolder(false);
                  setNewSubfolderName("");
                  setCreateSubfolderError("");
                }}
                style={cancelButton}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBFOLDER LIST */}
      <h2 style={{ marginTop: "2rem" }}>Subfolders</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {subfolders.map(folder => (
          <button
            key={folder.id}
            onClick={() => navigate(`/documents/folder/${folder.id}`)}
            style={{
              padding: "1rem",
              fontSize: "1.5rem",
              backgroundColor: "#0066cc",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            📁 {folder.name}
          </button>
        ))}
      </div>

      {/* DOCUMENT LIST */}
      <h2 style={{ marginTop: "2rem" }}>Documents</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {documents.map(doc => {
          const ext = getFileExtension(doc.latest_filename || "");
          const versionLabel = doc.latest_version_number
            ? ` (v${doc.latest_version_number})`
            : "";
          const extLabel = ext ? `.${ext}` : "";

          return (
            <div
              key={doc.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#004aad",
                color: "white",
                padding: "1rem",
                borderRadius: "8px"
              }}
            >
              <button
                onClick={() => navigate(`/documents/view/${doc.id}`)}
                style={{
                  background: "none",
                  border: "none",
                  color: "white",
                  fontSize: "1.3rem",
                  cursor: "pointer",
                  textAlign: "left",
                  flex: 1
                }}
              >
                📄 {doc.title}
                {versionLabel}
                {extLabel}
              </button>

              <button
                onClick={() => {
                  setEditDoc(doc);
                  setEditTitle(doc.title);
                  setEditDescription(doc.description || "");
                  setEditFolder(doc.folder_id);
                  setShowEdit(true);
                }}
                style={{
                  backgroundColor: "#ffa500",
                  border: "none",
                  color: "black",
                  padding: "0.5rem 1rem",
                  borderRadius: "6px",
                  cursor: "pointer",
                  marginLeft: "1rem"
                }}
              >
                Edit
              </button>
            </div>
          );
        })}
      </div>

      {/* EDIT DOCUMENT MODAL (rename/move) */}
      {showEdit && (
        <div style={modalOverlay}>
          <div style={modalBoxModern}>
            <h2>Edit Document</h2>

            <input
              type="text"
              placeholder="Document Title"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              style={inputStyle}
            />

            <textarea
              placeholder="Description (optional)"
              value={editDescription}
              onChange={e => setEditDescription(e.target.value)}
              style={textareaStyle}
            />

            <select
              value={editFolder}
              onChange={e => setEditFolder(e.target.value)}
              style={inputStyle}
            >
              <option value="">Select Folder</option>
              {allFolders.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>

            <div style={modalButtonRow}>
              <button onClick={updateDocument} style={primaryButton}>
                Save
              </button>
              <button
                onClick={() => setShowEdit(false)}
                style={cancelButton}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- SHARED MODAL STYLES ---------- */

const modalOverlay = {
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
};

const modalBoxModern = {
  backgroundColor: "white",
  padding: "2rem",
  borderRadius: "12px",
  width: "450px",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  boxShadow: "0 10px 30px rgba(0,0,0,0.25)"
};

const inputStyle = {
  padding: "0.5rem",
  fontSize: "1rem",
  borderRadius: "6px",
  border: "1px solid #ccc"
};

const textareaStyle = {
  padding: "0.5rem",
  fontSize: "1rem",
  borderRadius: "6px",
  border: "1px solid #ccc",
  minHeight: "80px"
};

const modalButtonRow = {
  display: "flex",
  gap: "1rem",
  marginTop: "0.5rem"
};

const primaryButton = {
  flex: 1,
  padding: "0.8rem",
  backgroundColor: "#004aad",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "600"
};

const cancelButton = {
  flex: 1,
  padding: "0.8rem",
  backgroundColor: "#999",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "600"
};
