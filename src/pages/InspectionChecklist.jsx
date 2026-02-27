import Layout from "../components/Layout";
import { useState } from "react";

export default function InspectionChecklist() {
  const employee = JSON.parse(localStorage.getItem("employee"));

  const initialState = {
    date: "",
    department: "",
    area: "",
    shift: "",
    inspector_comments: "",
    photo: null,

    q1: "", q1_corrected: "na",
    q2: "", q2_corrected: "na",
    q3: "", q3_corrected: "na",
    q4: "", q4_corrected: "na",
    q5: "", q5_corrected: "na",
    q6: "", q6_corrected: "na",
    q7: "", q7_corrected: "na",
    q8: "", q8_corrected: "na",
    q9: "", q9_corrected: "na",
    q10: "", q10_corrected: "na",
  };

  const [form, setForm] = useState(initialState);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      setForm({ ...form, photo: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();

    fd.append("inspector_id", employee.id);
    fd.append("inspector_name", employee.name);

    Object.keys(form).forEach((key) => {
      if (key === "photo") {
        if (form.photo) fd.append("photo", form.photo);
      } else {
        fd.append(key, form[key]);
      }
    });

    try {
      const res = await fetch("http://localhost:3000/api/inspection", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      console.log("Inspection Submitted:", data);

      alert("Inspection Checklist submitted successfully!");
      setForm(initialState);
    } catch (err) {
      console.error("Error submitting inspection:", err);
      alert("Error submitting inspection checklist.");
    }
  };

  const questions = [
    "Are Ladders being inspected?",
    "Safe material handling practices?",
    "Forklift inspections completed?",
    "Are all electrical wires in good condition?",
    "Is the area practicing good housekeeping?",
    "Are walkways clear and clearly marked?",
    "Are exit signs visible and operational?",
    "Are machine guards in place and in good condition?",
    "Inspect oxygen & acetylene tank storage?",
    "Inspect/make certain electrical panel is secure?",
  ];

  return (
    <Layout>
      <h1 style={{ marginBottom: "1rem", fontSize: "1.8rem", color: "#b30000" }}>
        Safety-Related Activity Report
      </h1>

      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          fontSize: "1.1rem",
        }}
      >
        <div
          style={{
            border: "2px solid #b30000",
            borderRadius: "8px",
            padding: "1.2rem",
            backgroundColor: "white",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ fontWeight: "bold" }}>Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "0.6rem",
                marginTop: "0.3rem",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ fontWeight: "bold" }}>Department</label>
            <select
              name="department"
              value={form.department}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "0.6rem",
                marginTop: "0.3rem",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
            >
              <option value="">Select Department</option>
              <option>Body Prep</option>
              <option>Press</option>
              <option>Glazeline</option>
              <option>Kiln</option>
              <option>LGV</option>
              <option>Glaze Prep</option>
              <option>Sorting</option>
              <option>Rectifying</option>
              <option>Maintenance</option>
              <option>Administration</option>
            </select>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ fontWeight: "bold" }}>Area</label>
            <input
              type="text"
              name="area"
              value={form.area}
              onChange={handleChange}
              placeholder="Exact area being inspected"
              style={{
                width: "100%",
                padding: "0.6rem",
                marginTop: "0.3rem",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ fontWeight: "bold" }}>Shift</label>
            <input
              type="text"
              name="shift"
              value={form.shift}
              onChange={handleChange}
              placeholder="Shift"
              style={{
                width: "100%",
                padding: "0.6rem",
                marginTop: "0.3rem",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
            />
          </div>

          <div>
            <label style={{ fontWeight: "bold" }}>Inspector Comments</label>
            <textarea
              name="inspector_comments"
              value={form.inspector_comments}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "0.6rem",
                marginTop: "0.3rem",
                borderRadius: "6px",
                border: "1px solid #ccc",
                height: "100px",
              }}
            />
          </div>
        </div>

        {questions.map((q, i) => {
          const qKey = `q${i + 1}`;
          const cKey = `q${i + 1}_corrected`;

          return (
            <div
              key={i}
              style={{
                border: "2px solid #b30000",
                borderRadius: "8px",
                padding: "1rem",
                backgroundColor: "white",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              }}
            >
              <label style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{q}</label>

              <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.6rem" }}>
                <label>
                  <input
                    type="radio"
                    name={qKey}
                    value="yes"
                    checked={form[qKey] === "yes"}
                    onChange={handleChange}
                  />{" "}
                  Yes
                </label>

                <label>
                  <input
                    type="radio"
                    name={qKey}
                    value="no"
                    checked={form[qKey] === "no"}
                    onChange={handleChange}
                  />{" "}
                  No
                </label>
              </div>

              <label
                style={{
                  fontWeight: "bold",
                  marginTop: "1rem",
                  display: "block",
                }}
              >
                Is the issue corrected?
              </label>

              <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.4rem" }}>
                <label>
                  <input
                    type="radio"
                    name={cKey}
                    value="yes"
                    checked={form[cKey] === "yes"}
                    onChange={handleChange}
                  />{" "}
                  Yes
                </label>

                <label>
                  <input
                    type="radio"
                    name={cKey}
                    value="no"
                    checked={form[cKey] === "no"}
                    onChange={handleChange}
                  />{" "}
                  No
                </label>

                <label>
                  <input
                    type="radio"
                    name={cKey}
                    value="na"
                    checked={form[cKey] === "na"}
                    onChange={handleChange}
                  />{" "}
                  N/A
                </label>
              </div>
            </div>
          );
        })}

        <div>
          <label style={{ fontWeight: "bold" }}>Upload Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleChange}
            style={{ marginTop: "0.5rem" }}
          />
        </div>

        <button
          type="submit"
          style={{
            padding: "0.8rem",
            backgroundColor: "#b30000",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "1.2rem",
            cursor: "pointer",
            marginTop: "1rem",
          }}
        >
          Submit Inspection
        </button>
      </form>
    </Layout>
  );
}