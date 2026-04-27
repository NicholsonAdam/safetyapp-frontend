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

  // CREATE DOCUMENT
  const [showCreateDoc, setShowCreateDoc] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // CREATE SUBFOLDER
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folderDescription, setFolderDescription] = useState("");

  // EDIT DOCUMENT
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

  // CREATE DOCUMENT
  const createDocument = async () => {
    await fetch(`${API}/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        folder_id: folderId,
        title,
        description,
        created_by: Number(localStorage.getItem("employee_id"))
      })
    });

    setShowCreateDoc(false);
    setTitle("");
    setDescription("");
    loadDocuments();
  };

  // CREATE SUBFOLDER
  const createSubfolder = async () => {
    await fetch(`${API}/folders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: folderName,
        description: folderDescription,
        parent_folder_id: folderId,
        created_by: Number(localStorage.getItem("employee_id"))
      })
    });

    setShowCreateFolder(false);
    setFolderName("");
    setFolderDescription("");
    loadSubfolders();
  };

  // UPDATE DOCUMENT
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
                  index === breadcrumbs.length - 1 ? "default" : "pointer",
                color:
                  index === breadcrumbs.length - 1 ? "black" : "#004aad",
                fontWeight:
                  index === breadcrumbs.length - 1 ? "600" : "500"
              }}
              onClick={() =>
                index === breadcrumbs.length - 1
                  ? null
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
          onClick={() => setShowCreateDoc(true)}
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
          + Create Document
        </button>

        <button
          onClick={() => setShowCreateFolder(true)}
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
          + Create Subfolder
        </button>
      </div>

      {/* CREATE DOCUMENT MODAL */}
      {showCreateDoc && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h2>Create Document</h2>

            <input
              type="text"
              placeholder="Document Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={inputStyle}
            />

            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={textareaStyle}
            />

            <div style={modalButtonRow}>
              <button onClick={createDocument} style={primaryButton}>
                Create
              </button>
              <button
                onClick={() => setShowCreateDoc(false)}
                style={cancelButton}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE SUBFOLDER MODAL */}
      {showCreateFolder && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h2>Create Subfolder</h2>

            <input
              type="text"
              placeholder="Folder Name"
              value={folderName}
              onChange={e => setFolderName(e.target.value)}
              style={inputStyle}
            />

            <textarea
              placeholder="Description (optional)"
              value={folderDescription}
              onChange={e => setFolderDescription(e.target.value)}
              style={textareaStyle}
            />

            <div style={modalButtonRow}>
              <button onClick={createSubfolder} style={primaryButton}>
                Create
              </button>
              <button
                onClick={() => setShowCreateFolder(false)}
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
        {documents.map(doc => (
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
                fontSize: "1.5rem",
                cursor: "pointer",
                textAlign: "left",
                flex: 1
              }}
            >
              📄 {doc.title}
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
        ))}
      </div>
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

const modalBox = {
  backgroundColor: "white",
  padding: "2rem",
  borderRadius: "10px",
  width: "400px",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
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
  gap: "1rem"
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
