import { useState } from "react";
import Layout from "../components/Layout";
import axios from "axios";

export default function ContactSupport() {
  const [date, setDate] = useState("");
  const [platform, setPlatform] = useState("");
  const [issue, setIssue] = useState("");
  const [photo, setPhoto] = useState(null);
  const [message, setMessage] = useState("");

  const API_URL = `${import.meta.env.VITE_API_URL}/api/support`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const employee = JSON.parse(localStorage.getItem("employee"));

    const formData = new FormData();
    formData.append("submitter_id", employee.id);
    formData.append("submitter_name", employee.name);
    formData.append("date", date);
    formData.append("platform", platform);
    formData.append("issue", issue);
    if (photo) formData.append("photo", photo);

    try {
      await axios.post(`${API_URL}/create`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("Support request submitted successfully");
      setDate("");
      setPlatform("");
      setIssue("");
      setPhoto(null);
    } catch (err) {
      setMessage("Submission failed");
    }
  };

  return (
    <Layout>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem", color: "#b30000" }}>
        Contact Support
      </h1>

      <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>

        <div style={{ marginBottom: "1rem" }}>
          <label><strong>Date</strong></label><br />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label><strong>Platform</strong></label><br />
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
          >
            <option value="">Select Platform</option>
            <option value="desktop">Desktop</option>
            <option value="tablet">Tablet</option>
            <option value="phone">Phone</option>
            <option value="qr">QR Code</option>
          </select>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label><strong>Issue</strong></label><br />
          <textarea
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
            rows="4"
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label><strong>Photo (optional)</strong></label><br />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files[0])}
          />
        </div>

        <button
          type="submit"
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#b30000",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Submit
        </button>
      </form>

      {message && (
        <p style={{ marginTop: "1rem", color: "#b30000" }}>{message}</p>
      )}
    </Layout>
  );
}