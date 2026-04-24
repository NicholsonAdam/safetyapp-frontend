import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";

export default function DocumentLibrary() {
  const navigate = useNavigate();
  const [folders, setFolders] = useState([]);
  const [showCreate, setShowCreate] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Load folders
  const loadFolders = () => {
    fetch("/api/folders")
      .then(res => res.json())
      .then(data => setFolders(data));
  };

  useEffect(() => {
    loadFolders();
  }, []);

  // Create folder
  const createFolder = async () => {
    await fetch("/api/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        parent_folder_id: null,
        created_by: localStorage.getItem("employee_id") // your app already stores this
      })
    });

    setShowCreate(false);
    setName("");
    setDescription("");
    loadFolders();
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
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
          marginBottom: "1.5rem"
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
            alignItems: "center"
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
            <h2>Create Folder</h2>

            <input
              type="text"
              placeholder="Folder Name"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ padding: "0.5rem", fontSize: "1rem" }}
            />

            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{ padding: "0.5rem", fontSize: "1rem" }}
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
                  cursor: "pointer"
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
                  cursor: "pointer"
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
              fontSize: "1.5rem",
              backgroundColor: "#004aad",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            {folder.name}
          </button>
        ))}
      </div>
    </div>
  );
}
