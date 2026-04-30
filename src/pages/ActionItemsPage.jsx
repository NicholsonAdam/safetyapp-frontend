import { useEffect, useState } from "react";
import ActionItemsTable from "../components/ActionItemsTable";
import ActionItemsFilters from "../components/ActionItemsFilters";
import NewActionItemModal from "../components/NewActionItemModal";

export default function ActionItemsPage() {
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
    <div style={{ padding: "20px" }}>
      <h1>Open Action Items</h1>
      <button
        onClick={() => setShowModal(true)}
        style={{ marginBottom: "20px", marginRight: "10px" }}
        >
        New Action Item
       </button>
      <button
        onClick={() => {
            const params = new URLSearchParams();

            if (filters.status) params.append("status", filters.status);
            if (filters.classification) params.append("classification", filters.classification);
            if (filters.search) params.append("search", filters.search);
            params.append("sort", filters.sort);
            params.append("direction", filters.direction);

            window.location.href = `/api/action-items/export/excel?${params.toString()}`;
        }}
        style={{ marginBottom: "20px" }}
        >
        Export to Excel
        </button>

      <ActionItemsFilters
        filters={filters}
        setFilters={setFilters}
        reload={loadItems}
      />

      <ActionItemsTable
        items={items}
        setItems={setItems}
        reload={loadItems}
        filters={filters}
        setFilters={setFilters}
        />

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
