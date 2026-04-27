import Layout from "../components/Layout";
import { useState } from "react";
import { login } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await login(employeeId, password);

      // Must change password?
      if (data.must_change_password) {
        localStorage.setItem("employee", JSON.stringify(data.employee));
        return navigate("/change-password");
      }

      // Normal login
      localStorage.setItem("token", data.token);
      localStorage.setItem("employee", JSON.stringify(data.employee));
      localStorage.setItem("employee_id", data.employee.employee_id);

      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <Layout>
      <div
        className="mobile-center"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          marginTop: "2rem",
        }}
      >
        <h1 className="mobile-title">Login</h1>

        <form
          onSubmit={handleSubmit}
          className="mobile-stack mobile-full"
          style={{
            marginTop: "1rem",
            display: "flex",
            flexDirection: "column",
            width: "250px",
            gap: "1rem",
          }}
        >
          <input
            type="text"
            placeholder="Employee ID"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="mobile-input"
            style={{
              padding: "0.5rem",
              fontSize: "1rem",
            }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mobile-input"
            style={{
              padding: "0.5rem",
              fontSize: "1rem",
            }}
          />

          <button
            type="submit"
            className="mobile-button"
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#b30000",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Login
          </button>
        </form>

        {error && (
          <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>
        )}
      </div>
    </Layout>
  );
}