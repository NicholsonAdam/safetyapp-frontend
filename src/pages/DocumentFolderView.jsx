import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useParams, useNavigate } from "react-router-dom";

export default function DocumentFolderView() {
  const { folderId } = useParams();
  const navigate = useNavigate();

  // DOCUMENTS + SUBFOLDERS
  const [documents, setDocuments] = useState([]);
  const [subfolders, setSubfolders] = useState([]);
  const [allFolders, setAllFolders] = useState([]);

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
    fetch(`/api/documents?folder_id=${folderId}`)
      .then(res => res.json())
      .then(data => setDocuments(data));
  };

  // LOAD SUBFOLDERS
  const loadSubfolders = () => {
    fetch(`/api/folders`)
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter(f => f.parent_folder_id == folderId);
        setSubfolders(filtered);
      });
  };

  // LOAD ALL FOLDERS (for move dropdown)
  const loadAllFolders = () => {
    fetch(`/api/folders`)
      .then(res => res.json())
      .then(data => setAllFolders(data));
  };

  useEffect(() => {
    loadDocuments();
    loadSubfolders();
    loadAllFolders();
  }, [folderId]);

  // CREATE DOCUMENT
  const createDocument = async () => {
    await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        folder_id: folderId,
        title,
        description,
        created_by: localStorage.getItem("employee_id")
      })
    });

    setShowCreateDoc(false);
    setTitle("");
    setDescription("");
    loadDocuments();
  };

  // CREATE SUBFOLDER
  const createSubfolder = async () => {
    await fetch("/api/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: folderName,
        description: folderDescription,
        parent_folder_id: folderId,
        created_by: localStorage.getItem("employee_id")
      })
    });

    setShowCreateFolder(false);
    setFolderName("");
    setFolderDescription("");
    loadSubfolders();
  };

  // UPDATE DOCUMENT
  const updateDocument = async () => {
    await fetch(`/api/documents/${editDoc.id}`, {
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
      <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
        Folder Contents
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
            <h2>Create Document</h2>

            <input
              type="text"
              placeholder="Document Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
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
                onClick={createDocument}
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
                onClick={() => setShowCreateDoc(false)}
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

      {/* CREATE SUBFOLDER MODAL */}
      {showCreateFolder && (
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
            <h2>Create Subfolder</h2>

            <input
              type="text"
              placeholder="Folder Name"
              value={folderName}
              onChange={e => setFolderName(e.target.value)}
              style={{ padding: "0.5rem", fontSize: "1rem" }}
            />

            <textarea
              placeholder="Description (optional)"
              value={folderDescription}
              onChange={e => setFolderDescription(e.target.value)}
              style={{ padding: "0.5rem", fontSize: "1rem" }}
            />

            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                onClick={createSubfolder}
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
                onClick={() => setShowCreateFolder(false)}
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

      {/* EDIT DOCUMENT MODAL */}
      {showEdit && (
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
            <h2>Edit Document</h2>

            <input
              type="text"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              style={{ padding: "0.5rem", fontSize: "1rem" }}
            />

            <textarea
              value={editDescription}
              onChange={e => setEditDescription(e.target.value)}
              style={{ padding: "0.5rem", fontSize: "1rem" }}
            />

            <select
              value={editFolder}
              onChange={e => setEditFolder(e.target.value)}
              style={{ padding: "0.5rem", fontSize: "1rem" }}
            >
              {allFolders.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                onClick={updateDocument}
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
                Save
              </button>

              <button
                onClick={() => setShowEdit(false)}
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
