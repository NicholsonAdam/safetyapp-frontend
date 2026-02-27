import { useNavigate, useLocation } from "react-router-dom";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isLoginPage = location.pathname.toLowerCase() === "/login";
  const isDashboardPage = location.pathname === "/dashboard";
  const isBBSPage = location.pathname === "/bbs";
  const isNearMissPage = location.pathname === "/nearmiss";
  const isSupportPage = location.pathname === "/support";
  const isInspectionPage = location.pathname === "/inspection";
  const isHuddlePage = location.pathname === "/huddle";

  const employee = JSON.parse(localStorage.getItem("employee"));

  const showHeroImage = isLoginPage || isDashboardPage;
  const isFormPage =
    isBBSPage ||
    isNearMissPage ||
    isSupportPage ||
    isInspectionPage ||
    isHuddlePage;

  const rightPanelBackground = isBBSPage
    ? "/BBS.jpg"
    : isNearMissPage
    ? "/nearmiss.jpg"
    : isSupportPage
    ? "/support.jpg"
    : isInspectionPage
    ? "/inspection.jpg"
    : isHuddlePage
    ? "/huddle.jpg"
    : null;

  const heroImage = showHeroImage ? "/Safety%202026.png" : null;

  return (
    <div
      className={`layout-container ${window.innerWidth <= 1700 ? "mobile" : "desktop"} ${
        isDashboardPage ? "dashboard-page" : ""}
          ${isBBSPage ? "bbs-page" : ""}
          ${isNearMissPage ? "nearmiss-page" : ""}
          ${isSupportPage ? "support-page" : ""}
          ${isInspectionPage ? "inspection-page" : ""}
          ${isHuddlePage ? "huddle-page" : ""}
        `}

      style={{
        display: "flex",
        minHeight: "100vh",
        width: "100%",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* LEFT PANEL */}
      <div
        className="left-panel"
        style={{
          backgroundColor: "#ffe5e5",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          top: 0,
        }}
      >
        <header
          style={{
            backgroundColor: "#b30000",
            color: "white",
            padding: "1rem 2rem",
            fontSize: "1.5rem",
            fontWeight: "bold",
            whiteSpace: "nowrap",
          }}
        >
          Safety Communication App
        </header>

        <main
          className={isLoginPage ? "login-center" : ""}
          style={{
            padding: "2rem",
            width: "100%",
          }}
        >
          {employee && !isLoginPage && (
            <>
              <h1 style={{ marginBottom: "1rem", fontSize: "2rem" }}>
                Welcome, {employee?.name}
              </h1>

              <p style={{ fontSize: "1.1rem" }}>
                Department: {employee?.department}
              </p>

              <p style={{ fontSize: "1.1rem", marginTop: "0.5rem" }}>
                Job Title: {employee?.job_title}
              </p>
            </>
          )}

          {(isLoginPage || isDashboardPage) && children}
        </main>

        <div
          style={{
            padding: "0 2rem 1rem 2rem",
            color: "#b30000",
            fontWeight: "bold",
            lineHeight: "1.3",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
            Dal‑Tile Safety
          </div>
          <div style={{ fontSize: "1rem" }}>
            Part of the Safety Management System
          </div>
          <div style={{ fontSize: "1rem" }}>A VPP Star Facility</div>
        </div>

        <div
          style={{
            padding: "1rem 2rem",
            marginTop: "auto",
          }}
        >
          <img
            src="/VPP.png"
            alt="VPP Star"
            style={{
              width: "100%",
              marginBottom: "1rem",
              borderRadius: "6px",
              objectFit: "contain",
            }}
          />

          <img
            src="/logo.jpg"
            alt="Logo"
            style={{
              width: "100%",
              borderRadius: "6px",
              objectFit: "contain",
            }}
          />
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div
        className={`right-panel ${
          showHeroImage && !isDashboardPage ? "hero-hide-mobile" : ""
        }`}
        style={{
          flex: 1,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          backgroundImage:
            isFormPage && rightPanelBackground
              ? `url(${rightPanelBackground})`
              : !isFormPage && heroImage
              ? `url(${heroImage})`
              : "none",
          backgroundSize: isFormPage ? "cover" : "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundColor: isFormPage ? "white" : "black",
          position: "relative",
          overflowY: "visible",
          scrollbarGutter: "stable",
          padding: isFormPage ? "2rem" : 0,
        }}
      >
        {/* STATIC BACKGROUND FOR FORM PAGES */}
        {rightPanelBackground && (
          <div
            className="form-bg"
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(255,255,255,0.3)",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
        )}

        {/* CONTENT */}
        <div
          className="form-content"
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            maxWidth: "900px",
            color: "black",
          }}
        >
          {/* BACK BUTTON FOR FORM PAGES */}
          {isFormPage && (
            <button
              onClick={() => navigate("/dashboard")}
              style={{
                marginBottom: "1.5rem",
                padding: "0.5rem 1rem",
                backgroundColor: "#b30000",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "1rem",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                transition: "all 0.2s ease-in-out",
              }}
            >
              ← Back to Dashboard
            </button>
          )}

          {/* ADMIN FLOATING BUTTONS */}
          {isDashboardPage && employee?.site_admin === "yes" && (
            <>
              <button
                onClick={() => navigate("/admin")}
                className="dashboard-mobile-buttons"
                style={{
                  position: "absolute",
                  top: "50px",
                  right: "-150px",
                  padding: "1rem 1.5rem",
                  backgroundColor: "#b30000",
                  color: "white",
                  border: "2px solid #b30000",
                  borderRadius: "8px",
                  fontSize: "2rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                  transition: "all 0.2s ease-in-out",
                  zIndex: 10,
                }}
              >
                Dashboard
              </button>

              <button
                onClick={() => navigate("/leaderwalk")}
                className="dashboard-mobile-buttons"
                style={{
                  position: "absolute",
                  top: "130px",
                  left: "830px",
                  width: "220px",
                  height: "60px",
                  backgroundColor: "#f8c5c5",
                  color: "#b30000",
                  border: "2px solid #b30000",
                  borderRadius: "8px",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                  transition: "all 0.2s ease-in-out",
                  zIndex: 5,
                }}
              >
                Leadership Walk (In Development)
              </button>
            </>
          )}

          {/* FORM PAGES */}
          {isBBSPage && children}
          {isNearMissPage && children}
          {isSupportPage && children}
          {isInspectionPage && children}
          {isHuddlePage && children}

          {/* DASHBOARD BUTTONS */}
          {isDashboardPage && (
            <>
              <button
                onClick={() => navigate("/bbs")}
                className="dashboard-mobile-buttons"
                style={{
                  position: "absolute",
                  top: "525px",
                  left: "500px",
                  width: "220px",
                  height: "60px",
                  backgroundColor: "white",
                  color: "#b30000",
                  border: "2px solid #b30000",
                  borderRadius: "8px",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                  transition: "all 0.2s ease-in-out",
                  zIndex: 5,
                }}
              >
                B.B.S. Observation
              </button>

              <button
                onClick={() => navigate("/nearmiss")}
                className="dashboard-mobile-buttons"
                style={{
                  position: "absolute",
                  top: "525px",
                  left: "750px",
                  width: "220px",
                  height: "60px",
                  backgroundColor: "white",
                  color: "#b30000",
                  border: "2px solid #b30000",
                  borderRadius: "8px",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                  transition: "all 0.2s ease-in-out",
                  zIndex: 5,
                }}
              >
                Near Miss Report / Safety Ideas
              </button>

              <button
                onClick={() => navigate("/inspection")}
                className="dashboard-mobile-buttons"
                style={{
                  position: "absolute",
                  top: "600px",
                  left: "500px",
                  width: "220px",
                  height: "60px",
                  backgroundColor: "white",
                  color: "#b30000",
                  border: "2px solid #b30000",
                  borderRadius: "8px",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                  transition: "all 0.2s ease-in-out",
                  zIndex: 5,
                }}
              >
                Safety-Related Activity
              </button>
              
              <button
                onClick={() => navigate("/support")}
                className="dashboard-mobile-buttons"
                style={{
                  position: "absolute",
                  top: "600px",
                  left: "750px",
                  width: "220px",
                  height: "60px",
                  backgroundColor: "white",
                  color: "#b30000",
                  border: "2px solid #b30000",
                  borderRadius: "8px",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                  transition: "all 0.2s ease-in-out",
                  zIndex: 5,
                }}
              >
                Contact Support
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}