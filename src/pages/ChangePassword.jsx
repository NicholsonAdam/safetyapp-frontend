import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function ChangePassword() {
  const navigate = useNavigate();
  const employee = JSON.parse(localStorage.getItem("employee"));

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!employee) {
      navigate("/login");
    }
  }, [employee, navigate]);

  const validatePassword = (pw) => {
    const minLength = pw.length >= 10;
    const hasUpper = /[A-Z]/.test(pw);
    const hasLower = /[a-z]/.test(pw);
    const hasNumber = /[0-9]/.test(pw);
    const hasSpecial = /[^A-Za-z0-9]/.test(pw);

    const categories = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

    if (!minLength) return "Password must be at least 10 characters.";
    if (categories < 3) return "Password must include 3 of: uppercase, lowercase, number, special character.";
    if (pw.includes(employee.employee_id)) return "Password cannot contain your employee ID.";
    if (pw.toLowerCase().includes(employee.name.toLowerCase())) return "Password cannot contain your name.";

    const banned = ["password", "123456", "qwerty", "welcome", "letmein"];
    if (banned.includes(pw.toLowerCase())) return "Password is too common.";

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const validationError = validatePassword(newPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await axios.post(`${API_URL}/auth/change-password`, {
        employeeId: employee.employee_id,
        newPassword,
      });

      setSuccess("Password updated successfully.");
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Error updating password.");
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
        <h1 className="mobile-title">Change Password</h1>

        <p style={{ 
            marginTop: "0.5rem",
            fontSize: "0.9rem",
            color: "#333",
            lineHeight: "1.4"
         }}>
            Your new password must meet the following requirements:
            <ul style={{ marginTop: "0.5rem", paddingLeft: "1.2rem" }}>
                <li>At least 10 characters long</li>
                <li>Includes at least one uppercase letter</li>
                <li>Includes at least one lowercase letter</li>
                <li>Includes at least one number</li>
                <li>Includes at least one special character</li>
                <li>Does not contain your name or employee ID</li>
            </ul>
        </p>

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
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mobile-input"
            style={{
              padding: "0.5rem",
              fontSize: "1rem",
            }}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
            Update Password
          </button>
        </form>

        {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
        {success && <p style={{ color: "green", marginTop: "1rem" }}>{success}</p>}
      </div>
    </Layout>
  );
}