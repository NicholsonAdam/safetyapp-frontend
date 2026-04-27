import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DocumentLibrary() {
  const navigate = useNavigate();
  const [folders, setFolders] = useState([]);
  const [showCreate, setShowCreate] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const API = import.meta.env.VITE_API_URL; // already ends with /api

  // Load folders
  const loadFolders = () => {
    console.log("FETCHING:", `${API}/folders`);

    fetch(`${API}/folders`)
      .then(res => res.json())
      .then(data => setFolders(data))
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
          created_by: localStorage.getItem("employee_id")
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
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      {/* Back Button */}
      <button
        onClick={() => navigate("/leader-tools")}
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

      <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem", color: "#004aad" }}>
        Document Library
      </h1>

      {/* CREATE FOLDER BUTTON */}
      <button
        onClick={() => setShowCreate(true)}
        style={{
          padding: "0.8rem 1.2rem",
          fontSize: "1.2rem",
          backgroundColor: "#008000",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          marginBottom: "1.5rem",
          fontWeight: "600"
        }}
      >
        + Create Folder
      </button>

      {/* CREATE FOLDER MODAL */}
      {showCreate && (
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
            zIndex: 9999
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
              gap: "1rem",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
            }}
          >
            <h2 style={{ margin: 0 }}>Create Folder</h2>

            <input
              type="text"
              placeholder="Folder Name"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{
                padding: "0.5rem",
                fontSize: "1rem",
                borderRadius: "6px",
                border: "1px solid #ccc"
              }}
            />

            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{
                padding: "0.5rem",
                fontSize: "1rem",
                borderRadius: "6px",
                border: "1px solid #ccc",
                minHeight: "80px"
              }}
            />

            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                onClick={createFolder}
                style={{
                  flex: 1,
                  padding: "0.8rem",
                  backgroundColor: "#004aad",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600"
                }}
              >
                Create
              </button>

              <button
                onClick={() => setShowCreate(false)}
                style={{
                  flex: 1,
                  padding: "0.8rem",
                  backgroundColor: "#999",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600"
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOLDER LIST */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {folders.map(folder => (
          <button
            key={folder.id}
            onClick={() => navigate(`/documents/folder/${folder.id}`)}
            style={{
              padding: "1rem",
              fontSize: "1.4rem",
              backgroundColor: "#004aad",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              textAlign: "left",
              fontWeight: "600",
              boxShadow: "0 4px 8px rgba(0,0,0,0.15)"
            }}
          >
            📁 {folder.name}
          </button>
        ))}
      </div>
    </div>
  );
}
