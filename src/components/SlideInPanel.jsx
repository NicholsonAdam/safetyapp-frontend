export default function SlideInPanel({ isOpen, onClose, title, children, width = "400px" }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        height: "100vh",
        width: isOpen ? width : "0px",
        backgroundColor: "white",
        boxShadow: isOpen ? "-4px 0 12px rgba(0,0,0,0.2)" : "none",
        overflowX: "hidden",
        overflowY: "auto",
        transition: "width 0.3s ease",
        zIndex: 9999,
      }}
    >
      {/* HEADER */}
      <div
        style={{
          padding: "1.5rem",
          borderBottom: "1px solid #ddd",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ margin: 0 }}>{title}</h2>

        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            fontSize: "1.5rem",
            cursor: "pointer",
          }}
        >
          ×
        </button>
      </div>

      {/* CONTENT */}
      <div style={{ padding: "1.5rem" }}>{children}</div>
    </div>
  );
}