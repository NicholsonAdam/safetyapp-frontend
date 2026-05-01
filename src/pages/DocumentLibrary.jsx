import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DocumentLibrary() {
  const navigate = useNavigate();
  const [folders, setFolders] = useState([]);
  const [showCreate, setShowCreate] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const API = import.meta.env.VITE_API_URL;

  // Load ONLY top-level folders
  const loadFolders = () => {
    fetch(`${API}/folders`)
      .then(res => res.json())
      .then(data => {
        const topLevel = data.filter(f => f.parent_folder_id === null);
        setFolders(topLevel);
      })
      .catch(err => console.error("Error loading folders:", err));
  };

  useEffect(() => {
    loadFolders();
  }, []);

  // Create folder
  const createFolder = async () => {
    try {
      await fetch(`${API}/folders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          parent_folder_id: null,
          created_by: Number(localStorage.getItem("employee_id"))
        })
      });

      setShowCreate(false);
      setName("");
      setDescription("");
      loadFolders();
    } catch (err) {
      console.error("Error creating folder:", err);
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
          Document Library
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

      {/* CREATE FOLDER BUTTON */}
      <button
        onClick={() => setShowCreate(true)}
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
        + Create Folder
      </button>

      {/* CREATE FOLDER MODAL */}
      {showCreate && (
        <Modal>
          <ModalBox>
            <h2>Create Folder</h2>

            <input
              type="text"
              placeholder="Folder Name"
              value={name}
              onChange={e => setName(e.target.value)}
              style={input}
            />

            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={textarea}
            />

            <div style={modalRow}>
              <button
                onClick={createFolder}
                style={{ ...btnPrimary, flex: 1 }}
              >
                Create
              </button>

              <button
                onClick={() => setShowCreate(false)}
                style={{ ...btnCancel, flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </ModalBox>
        </Modal>
      )}

      {/* FOLDER LIST */}
      <h2 style={{ marginBottom: "10px" }}>Folders</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {folders.map(folder => (
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
    </div>
  );
}

/* ---------- SHARED STYLES ---------- */

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
