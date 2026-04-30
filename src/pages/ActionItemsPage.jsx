import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ActionItemsTable from "../components/ActionItemsTable";
import ActionItemsFilters from "../components/ActionItemsFilters";
import NewActionItemModal from "../components/NewActionItemModal";

export default function ActionItemsPage() {
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
    classification: "",
    search: "",
    sort: "id",
    direction: "asc",
    department: "",
    owner: "",
  });

  const loadItems = async () => {
    const params = new URLSearchParams();

    if (filters.status) params.append("status", filters.status);
    if (filters.classification) params.append("classification", filters.classification);
    if (filters.search) params.append("search", filters.search);
    if (filters.department) params.append("department", filters.department);
    if (filters.owner) params.append("owner", filters.owner);

    params.append("sort", filters.sort);
    params.append("direction", filters.direction);

    const res = await fetch(`/api/action-items?${params.toString()}`);
    const data = await res.json();
    setItems(data);
  };

  useEffect(() => {
    loadItems();
  }, []);

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "1300px",
        margin: "0 auto",
      }}
    >
      {/* HEADER BAR */}
      <div
        style={{
          background: "#333333",
          padding: "16px 20px",
          borderRadius: "8px",
          marginBottom: "20px",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 3px 8px rgba(0,0,0,0.25)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "600" }}>
          Open Action Items
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
            fontWeight: "600",
          }}
        >
          ← Back to LeaderWalk
        </button>
      </div>

      {/* ACTION BUTTONS */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "12px" }}>
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: "10px 16px",
            background: "#B30000",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          }}
        >
          + New Action Item
        </button>

        <button
          onClick={() => {
            const params = new URLSearchParams();

            if (filters.status) params.append("status", filters.status);
            if (filters.classification) params.append("classification", filters.classification);
            if (filters.search) params.append("search", filters.search);
            if (filters.department) params.append("department", filters.department);
            if (filters.owner) params.append("owner", filters.owner);

            params.append("sort", filters.sort);
            params.append("direction", filters.direction);

            window.location.href = `/api/action-items/export/excel?${params.toString()}`;
          }}
          style={{
            padding: "10px 16px",
            background: "#800000",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          }}
        >
          ⬇ Export to Excel
        </button>
      </div>

      {/* FILTERS */}
      <div
        style={{
          background: "#F5F5F5",
          padding: "16px",
          borderRadius: "8px",
          marginBottom: "20px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        }}
      >
        <ActionItemsFilters
          filters={filters}
          setFilters={setFilters}
          reload={loadItems}
        />
      </div>

      {/* TABLE */}
      <div
        style={{
          background: "white",
          padding: "16px",
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        }}
      >
        <ActionItemsTable
          items={items}
          setItems={setItems}
          reload={loadItems}
          filters={filters}
          setFilters={setFilters}
        />
      </div>

      {/* MODAL */}
      {showModal && (
        <NewActionItemModal
          onClose={() => setShowModal(false)}
          onCreate={async (form) => {
            await fetch("/api/action-items", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(form),
            });

            setShowModal(false);
            loadItems();
          }}
        />
      )}
    </div>
  );
}
