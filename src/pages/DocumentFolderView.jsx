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

  // UPLOAD DOCUMENT
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

  // EDIT DOCUMENT
  const [showEdit, setShowEdit] = useState(false);
  const [editDoc, setEditDoc] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editFolder, setEditFolder] = useState("");

  // LOADERS
  const loadDocuments = () => {
    fetch(`${API}/documents?folder_id=${folderId}`)
      .then(res => res.json())
      .then(data => setDocuments(data));
  };

  const loadSubfolders = () => {
    fetch(`${API}/folders`)
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter(f => f.parent_folder_id == folderId);
        setSubfolders(filtered);
      });
  };

  const loadAllFolders = () => {
    fetch(`${API}/folders`)
      .then(res => res.json())
      .then(data => setAllFolders(data));
  };

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

  // CREATE DOCUMENT
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

    if (!res.ok) throw new Error("Failed to create document metadata");

    return await res.json();
  };

  const uploadInitialVersion = async documentId => {
    const formData = new FormData();
    formData.append("file", newDocFile);
    formData.append("uploaded_by", localStorage.getItem("employee_id"));
    formData.append("change_comment", newDocComment);

    const res = await fetch(`${API}/documentversions/${documentId}`, {
      method: "POST",
      body: formData
    });

    if (!res.ok) throw new Error("Failed to upload initial version");
  };

  const handleUploadDocument = async () => {
    setUploadDocError("");
    setUploadDocLoading(true);

    try {
      const doc = await createDocumentMetadata();
      await uploadInitialVersion(doc.id);

      setShowUploadDoc(false);
      setNewDocTitle("");
      setNewDocDescription("");
      setNewDocFile(null);
      setNewDocComment("Initial Upload");

      loadDocuments();
    } catch (err) {
      setUploadDocError(err.message);
    } finally {
      setUploadDocLoading(false);
    }
  };

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

  const getFileExtension = filename => {
    if (!filename) return "";
    const parts = filename.split(".");
    return parts.length < 2 ? "" : parts.pop().toLowerCase();
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
          Document Library
        </h1>

        <button
          onClick={() => navigate("/documents")}
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
          ← Back to Library
        </button>
      </div>

      {/* BREADCRUMBS CARD */}
      <div
        style={{
          background: "white",
          padding: "16px",
          borderRadius: "8px",
          marginBottom: "20px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
        }}
      >
        <div style={{ fontSize: "1.2rem", fontWeight: "600" }}>
          <span
            style={{ cursor: "pointer", color: "#B30000" }}
            onClick={() => navigate("/documents")}
          >
            Document Library
          </span>

          {breadcrumbs.map(folder => (
            <span key={folder.id}>
              {" > "}
              <span
                style={{ cursor: "pointer", color: "#800000" }}
                onClick={() => navigate(`/documents/folder/${folder.id}`)}
              >
                {folder.name}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        <button
          onClick={() => setShowUploadDoc(true)}
          style={btnPrimary}
        >
          + Upload Document
        </button>

        <button
          onClick={() => setShowCreateSubfolder(true)}
          style={btnSecondary}
        >
          + Create Subfolder
        </button>
      </div>

      {/* SUBFOLDERS */}
      <h2 style={{ marginTop: "1rem", marginBottom: "0.5rem" }}>Subfolders</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {subfolders.map(folder => (
          <div
            key={folder.id}
            onClick={() => navigate(`/documents/folder/${folder.id}`)}
            style={folderCard}
          >
            <span style={{ fontSize: "1.3rem", fontWeight: "600" }}>
              📁 {folder.name}
            </span>
          </div>
        ))}
      </div>

      {/* DOCUMENTS */}
      <h2 style={{ marginTop: "2rem", marginBottom: "0.5rem" }}>Documents</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {documents.map(doc => {
          const ext = getFileExtension(doc.latest_filename);
          const versionLabel = doc.latest_version_number
            ? ` (v${doc.latest_version_number})`
            : "";
          const extLabel = ext ? `.${ext}` : "";

          return (
            <div key={doc.id} style={docCard}>
              <button
                onClick={() => navigate(`/documents/view/${doc.id}`)}
                style={docTitleButton}
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
                style={editButton}
              >
                Edit
              </button>
            </div>
          );
        })}
      </div>

      {/* UPLOAD MODAL */}
      {showUploadDoc && (
        <Modal>
          <ModalBox>
            <h2>Upload Document</h2>

            <input
              type="text"
              placeholder="Document Title"
              value={newDocTitle}
              onChange={e => setNewDocTitle(e.target.value)}
              style={input}
            />

            <textarea
              placeholder="Description (optional)"
              value={newDocDescription}
              onChange={e => setNewDocDescription(e.target.value)}
              style={textarea}
            />

            <input
              type="file"
              onChange={e => setNewDocFile(e.target.files[0] || null)}
              style={input}
            />

            <textarea
              placeholder='Explain the revision (default: "Initial Upload")'
              value={newDocComment}
              onChange={e => setNewDocComment(e.target.value)}
              style={textarea}
            />

            {uploadDocError && (
              <div style={{ color: "red", fontSize: "0.9rem" }}>
                {uploadDocError}
              </div>
            )}

            <div style={modalRow}>
              <button
                onClick={handleUploadDocument}
                disabled={!newDocTitle.trim() || !newDocFile}
                style={{
                  ...btnPrimary,
                  flex: 1,
                  opacity:
                    !newDocTitle.trim() || !newDocFile ? 0.6 : 1,
                  cursor:
                    !newDocTitle.trim() || !newDocFile
                      ? "not-allowed"
                      : "pointer"
                }}
              >
                {uploadDocLoading ? "Uploading..." : "Upload"}
              </button>

              <button
                onClick={() => setShowUploadDoc(false)}
                style={{ ...btnCancel, flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </ModalBox>
        </Modal>
      )}

      {/* CREATE SUBFOLDER MODAL */}
      {showCreateSubfolder && (
        <Modal>
          <ModalBox>
            <h2>Create Subfolder</h2>

            <input
              type="text"
              placeholder="Subfolder Name"
              value={newSubfolderName}
              onChange={e => setNewSubfolderName(e.target.value)}
              style={input}
            />

            {createSubfolderError && (
              <div style={{ color: "red", fontSize: "0.9rem" }}>
                {createSubfolderError}
              </div>
            )}

            <div style={modalRow}>
              <button
                onClick={async () => {
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
                        parent_folder_id: folderId,
                        created_by: Number(localStorage.getItem("employee_id"))
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
                style={{ ...btnPrimary, flex: 1 }}
              >
                Create
              </button>

              <button
                onClick={() => setShowCreateSubfolder(false)}
                style={{ ...btnCancel, flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </ModalBox>
        </Modal>
      )}

      {/* EDIT DOCUMENT MODAL */}
      {showEdit && (
        <Modal>
          <ModalBox>
            <h2>Edit Document</h2>

            <input
              type="text"
              placeholder="Document Title"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              style={input}
            />

            <textarea
              placeholder="Description (optional)"
              value={editDescription}
              onChange={e => setEditDescription(e.target.value)}
              style={textarea}
            />

            <select
              value={editFolder}
              onChange={e => setEditFolder(e.target.value)}
              style={input}
            >
              <option value="">Select Folder</option>
              {allFolders.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>

            <div style={modalRow}>
              <button
                onClick={updateDocument}
                style={{ ...btnPrimary, flex: 1 }}
              >
                Save
              </button>

              <button
                onClick={() => setShowEdit(false)}
                style={{ ...btnCancel, flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </ModalBox>
        </Modal>
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

const folderCard = {
  background: "white",
  borderLeft: "6px solid #B30000",
  padding: "14px 18px",
  borderRadius: "8px",
  cursor: "pointer",
  boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
  fontSize: "1.2rem",
  fontWeight: "600"
};

const docCard = {
  background: "white",
  borderLeft: "6px solid #800000",
  padding: "14px 18px",
  borderRadius: "8px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
};

const docTitleButton = {
  background: "none",
  border: "none",
  color: "#333",
  fontSize: "1.2rem",
  cursor: "pointer",
  textAlign: "left",
  flex: 1,
  fontWeight: "600"
};

const editButton = {
  background: "#ffa500",
  border: "none",
  color: "black",
  padding: "8px 12px",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "600"
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