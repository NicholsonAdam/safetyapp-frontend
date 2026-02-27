import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

  // -----------------------------------------
  // TEMPORARY STATUS FLAGS (edit these only)
  // -----------------------------------------
  const pageStatus = {
    employees: "notdone",
    bbs: "notdone",
    nearmiss: "notdone",
    inspection: "notdone",
    huddle: "repair",
    leaderwalk: "inDevelopment",
    analytics: "inDevelopment",
  };

  // Light green for done, white for not done
  const statusColors = {
    done: "#c8f7c5",
    inDevelopment: "#f8c5c5",
    repair: "lightyellow",
    notdone: "white",
  };

  // Merge base card style with background color
  function getCardStyle(statusKey) {
    return {
      ...cardStyle,
      backgroundColor: statusColors[pageStatus[statusKey]],
    };
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        padding: "2rem",
        fontFamily: "Arial, sans-serif",
        overflowX: "hidden",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {/* Background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/showroom.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.3,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* TOP BAR */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          maxWidth: "1200px",
          marginInline: "auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        <h1
          style={{
            fontSize: "2rem",
            color: "#b30000",
            fontWeight: "bold",
            margin: 0,
          }}
        >
          Admin Dashboard
        </h1>

        <button
          onClick={() => navigate("/dashboard")}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#b30000",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "0.9rem",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
            transition: "all 0.2s ease-in-out",
          }}
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* GRID OF MODULE CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1.2rem",
          maxWidth: "1200px",
          marginInline: "auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* EMPLOYEE DATABASE */}
        <div
          onClick={() => navigate("/admin/employees")}
          style={getCardStyle("employees")}
        >
          <img
            src="/employeeicon.png"
            alt="Employee Icon"
            style={{ width: "70px", height: "70px", marginBottom: "0.5rem" }}
          />
          <h2 style={cardTitle}>Employee Database</h2>
          <p style={cardText}>Manage employee records.</p>
        </div>

        {/* BBS RECORDS */}
        <div
          onClick={() => navigate("/admin/bbs")}
          style={getCardStyle("bbs")}
        >
          <img
            src="/BBSicon.png"
            alt="BBS Icon"
            style={{ width: "70px", height: "70px", marginBottom: "0.5rem" }}
          />
          <h2 style={cardTitle}>BBS Records</h2>
          <p style={cardText}>Review all BBS submissions.</p>
        </div>

        {/* NEAR MISS RECORDS */}
        <div
          onClick={() => navigate("/admin/nearmiss")}
          style={getCardStyle("nearmiss")}
        >
          <img
            src="/nearmissicon.jpg"
            alt="Near Miss Icon"
            style={{ width: "70px", height: "70px", marginBottom: "0.5rem" }}
          />
          <h2 style={cardTitle}>Near Miss Records</h2>
          <p style={cardText}>Manage Near Miss reports.</p>
        </div>

        {/* INSPECTION CHECKLIST RECORDS */}
        <div
          onClick={() => navigate("/admin/inspection")}
          style={getCardStyle("inspection")}
        >
          <img
            src="/inspectionicon.jpg"
            alt="Inspection Icon"
            style={{ width: "70px", height: "70px", marginBottom: "0.5rem" }}
          />
          <h2 style={cardTitle}>Inspection Records</h2>
          <p style={cardText}>Manage inspection checklists.</p>
        </div>

        {/* SAFETY HUDDLE RECORDS */}
        <div
          onClick={() => navigate("/admin/huddle")}
          style={getCardStyle("huddle")}
        >
          <img
            src="/huddleicon.png"
            alt="Safety Huddle Icon"
            style={{ width: "70px", height: "70px", marginBottom: "0.5rem" }}
          />
          <h2 style={cardTitle}>Safety Huddle</h2>
          <p style={cardText}>View huddle reports.</p>
        </div>

        {/* LEADERSHIP WALK RECORDS */}
        <div
          onClick={() => navigate("/admin/leaderwalk")}
          style={getCardStyle("leaderwalk")}
        >
          <img
            src="/walkicon.png"
            alt="Leadership Walk Icon"
            style={{ width: "70px", height: "70px", marginBottom: "0.5rem" }}
          />
          <h2 style={cardTitle}>Leadership Walk</h2>
          <p style={cardText}>Review walk submissions. IN DEVELOPMENT</p>
        </div>

        {/* ANALYTICS */}
        <div
          onClick={() => navigate("/admin/analytics")}
          style={getCardStyle("analytics")}
        >
          <img
            src="/analyticsicon.png"
            alt="Analytics Icon"
            style={{ width: "70px", height: "70px", marginBottom: "0.5rem" }}
          />
          <h2 style={cardTitle}>Analytics</h2>
          <p style={cardText}>View safety trends. IN DEVELOPMENT</p>
        </div>
      </div>
    </div>
  );
}

/* Shared styles */
const cardStyle = {
  padding: "1rem",
  borderRadius: "10px",
  boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
  cursor: "pointer",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  border: "2px solid #b30000",
  textAlign: "center",
};

const cardTitle = {
  color: "#b30000",
  marginBottom: "0.3rem",
  fontSize: "1.5rem",
};

const cardText = {
  color: "#333",
  fontSize: "1.3rem",
  lineHeight: "1.3",
};