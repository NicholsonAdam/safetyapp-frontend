import { useState } from "react";
import Layout from "../components/Layout";
import axios from "axios";

export default function NearMissForm() {
  const employee = JSON.parse(localStorage.getItem("employee"));
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [additionalTeam, setAdditionalTeam] = useState("");
  const [reportTypes, setReportTypes] = useState([]);
  const [description, setDescription] = useState("");
  const [actionsTaken, setActionsTaken] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [followup, setFollowup] = useState("");
  const [photo, setPhoto] = useState(null);
  const [message, setMessage] = useState("");

  const API_URL = `${import.meta.env.VITE_API_URL}/api/nearmiss`;

  const departments = [
    "Body Prep",
    "Press",
    "Glazeline",
    "Kiln",
    "LGV",
    "Glaze Prep",
    "Sorting",
    "Rectifying",
    "Administration",
    "Maintenance",
  ];

  const reportTypeOptions = [
    "Near Miss",
    "Unsafe Condition",
    "Unsafe Act",
    "Safety Concern",
    "Safety Improvement Idea",
    "General Safety Communication",
  ];

  const toggleReportType = (type) => {
    setReportTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const formData = new FormData();
    formData.append("observer_id", employee.id);
    formData.append("observer_name", employee.name);
    formData.append("department", department);
    formData.append("location", location);
    formData.append("date", date);
    formData.append("shift", employee.shift || "");
    formData.append("additionalTeam", additionalTeam);
    formData.append("reportTypes", JSON.stringify(reportTypes));
    formData.append("description", description);
    formData.append("actionsTaken", actionsTaken);
    formData.append("suggestion", suggestion);
    formData.append("followup", followup);
    if (photo) formData.append("photo", photo);

    try {
      await axios.post(`${API_URL}/create`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("Near Miss submitted successfully");

      // Reset fields
      setDepartment("");
      setLocation("");
      setDate("");
      setAdditionalTeam("");
      setReportTypes([]);
      setDescription("");
      setActionsTaken("");
      setSuggestion("");
      setFollowup("");
      setPhoto(null);
    } catch (err) {
      setMessage("Submission failed");
    }
  };

  return (
    <Layout>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem", color: "#b30000" }}>
        Near Miss Report / Safety Ideas
      </h1>

      <p style={{ marginBottom: "2rem", fontSize: "1.1rem" }}>
        Use this form to report near misses, unsafe conditions, safety concerns,
        or ideas to improve safety. Reporting is encouraged and non-punitive.
      </p>

      <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>

        {/* Department */}
        <div style={{ marginBottom: "1rem" }}>
          <label><strong>Department</strong></label><br />
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div style={{ marginBottom: "1rem" }}>
          <label><strong>Location</strong></label><br />
          <input
            type="text"
            placeholder="Glazeline 9 Loader, Kiln 3 Exit Table, etc."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        {/* Date */}
        <div style={{ marginBottom: "1rem" }}>
          <label><strong>Date</strong></label><br />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        {/* Additional Team Members */}
        <div style={{ marginBottom: "1rem" }}>
          <label><strong>Additional Team Members (Employee IDs)</strong></label><br />
          <input
            type="text"
            placeholder="123456, 165432"
            value={additionalTeam}
            onChange={(e) => setAdditionalTeam(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        {/* Report Type */}
        <div style={{ marginBottom: "1rem" }}>
          <label><strong>Report Type</strong></label>
          {reportTypeOptions.map((type) => (
            <div key={type}>
              <label>
                <input
                  type="checkbox"
                  checked={reportTypes.includes(type)}
                  onChange={() => toggleReportType(type)}
                  style={{ marginRight: "0.5rem" }}
                />
                {type}
              </label>
            </div>
          ))}
        </div>

        {/* Description */}
        <div style={{ marginBottom: "1rem" }}>
          <label><strong>Description</strong></label><br />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        {/* Immediate Actions */}
        <div style={{ marginBottom: "1rem" }}>
          <label><strong>Immediate Actions Taken (if any)</strong></label><br />
          <textarea
            value={actionsTaken}
            onChange={(e) => setActionsTaken(e.target.value)}
            rows="3"
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        {/* Suggested Corrective Action */}
        <div style={{ marginBottom: "1rem" }}>
          <label><strong>Suggested Corrective Action</strong></label><br />
          <textarea
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            rows="3"
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        {/* Follow-up */}
        <div style={{ marginBottom: "1rem" }}>
          <label><strong>Do you want a follow-up contact from Safety?</strong></label><br />
          <label style={{ marginRight: "1rem" }}>
            <input
              type="radio"
              name="followup"
              value="yes"
              checked={followup === "yes"}
              onChange={(e) => setFollowup(e.target.value)}
              style={{ marginRight: "0.5rem" }}
            />
            Yes
          </label>

          <label>
            <input
              type="radio"
              name="followup"
              value="no"
              checked={followup === "no"}
              onChange={(e) => setFollowup(e.target.value)}
              style={{ marginRight: "0.5rem" }}
            />
            No
          </label>
        </div>

        {/* Photo Upload */}
        <div style={{ marginBottom: "1rem" }}>
          <label><strong>Photo (optional)</strong></label><br />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files[0])}
          />
        </div>

        {/* Submit */}
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