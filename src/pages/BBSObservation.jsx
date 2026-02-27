import Layout from "../components/Layout";
import { useState } from "react";

export default function BBSObservation() {
  const employee = JSON.parse(localStorage.getItem("employee"));

  const [form, setForm] = useState({
    date: "",
    additional_observers: "",
    additional_observers_array: [],
    area: "",
    shift: "",
    job_area: "",
    job_task: "",
    ppe_safe: false,
    ppe_concern: false,
    ppe_comments: "",
    position_safe: false,
    position_concern: false,
    position_comments: "",
    tools_safe: false,
    tools_concern: false,
    tools_comments: "",
    conditions_safe: false,
    conditions_concern: false,
    conditions_comments: "",
    unsafe_about_activity: "",
    promote_safety: "",
    team_member_comments: "",
    observer_comments: "",
    followup_contact: "",   // "yes" or "no"
    photo: null,
  });

const handleChange = (e) => {
  const { name, value, type, checked, files } = e.target;

  if (type === "checkbox") {
    setForm({ ...form, [name]: checked });
  } else if (type === "file") {
    setForm({ ...form, photo: files[0] });
  } else {
    // Special handling for Additional Observers
    if (name === "additional_observers") {
      const parsed = value
        .split(",")                // split on commas
        .map(id => id.trim())      // trim spaces
        .filter(id => id !== "");  // remove empty entries

      setForm({
        ...form,
        additional_observers: value,        // raw text for the input box
        additional_observers_array: parsed, // clean array for backend
      });
    } else {
      // Default for all other text inputs
      setForm({ ...form, [name]: value });
    }
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();

  const fd = new FormData();

  // Logged-in employee info
  fd.append("observer_id", employee.id);
  fd.append("observer_name", employee.name);

  // All form fields
  Object.keys(form).forEach((key) => {
    if (key === "photo") {
      if (form.photo) fd.append("photo", form.photo);
    } else if (key === "additional_observers_array") {
      fd.append("additional_observers_array", JSON.stringify(form.additional_observers_array || []));
    } else {
      fd.append(key, form[key]);
    }
  });

  try {
    const res = await fetch("http://localhost:3000/api/bbs", {
      method: "POST",
      body: fd,
    });

    const data = await res.json();
    console.log("BBS Submitted:", data);

    alert("BBS Observation submitted successfully!");

    // Reset form
    setForm({
      date: "",
      additional_observers: "",
      additional_observers_array: [],
      area: "",
      shift: "",
      job_area: "",
      job_task: "",
      ppe_safe: false,
      ppe_concern: false,
      ppe_comments: "",
      position_safe: false,
      position_concern: false,
      position_comments: "",
      tools_safe: false,
      tools_concern: false,
      tools_comments: "",
      conditions_safe: false,
      conditions_concern: false,
      conditions_comments: "",
      unsafe_about_activity: "",
      promote_safety: "",
      team_member_comments: "",
      observer_comments: "",
      followup_contact: "",
      photo: null,
    });

  } catch (err) {
    console.error("Error submitting BBS:", err);
    alert("Error submitting BBS observation.");
  }
};

  return (
    <Layout>
      <h1 style={{ marginBottom: "1rem", fontSize: "1.8rem", color: "#b30000" }}>
        B.B.S. Observation
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
        {/* DATE */}
        <div>
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

        {/* ADDITIONAL OBSERVERS */}
        <div>
          <label style={{ fontWeight: "bold" }}>Additional Observers (Employee IDs) (add multiples by separating with a comma)</label>
          <input
            type="text"
            name="additional_observers"
            placeholder="e.g., 123456"
            value={form.additional_observers}
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

        {/* AREA DROPDOWN */}
        <div>
          <label style={{ fontWeight: "bold" }}>Area</label>
          <select
            name="area"
            value={form.area}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "0.6rem",
              marginTop: "0.3rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          >
            <option value="">Select Area</option>
            <option>Body Prep</option>
            <option>Press</option>
            <option>Glazeline</option>
            <option>Kiln</option>
            <option>LGV</option>
            <option>Glaze Prep</option>
            <option>Sorting</option>
            <option>Rectifying</option>
            <option>Administration</option>
            <option>Maintenance</option>
          </select>
        </div>

        {/* SHIFT */}
        <div>
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

        {/* JOB AREA */}
        <div>
          <label style={{ fontWeight: "bold" }}>Job Area</label>
          <input
            type="text"
            name="job_area"
            value={form.job_area}
            onChange={handleChange}
            placeholder="Specific area or equipment"
            style={{
              width: "100%",
              padding: "0.6rem",
              marginTop: "0.3rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        {/* JOB TASK */}
        <div>
          <label style={{ fontWeight: "bold" }}>Job Task</label>
          <input
            type="text"
            name="job_task"
            value={form.job_task}
            onChange={handleChange}
            placeholder="What task is being performed?"
            style={{
              width: "100%",
              padding: "0.6rem",
              marginTop: "0.3rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        {/* SAFETY CATEGORIES */}
        {[
          { label: "PPE", safe: "ppe_safe", concern: "ppe_concern", comments: "ppe_comments" },
          { label: "Proper Position", safe: "position_safe", concern: "position_concern", comments: "position_comments" },
          { label: "Tools & Equipment", safe: "tools_safe", concern: "tools_concern", comments: "tools_comments" },
          { label: "Unsafe Conditions", safe: "conditions_safe", concern: "conditions_concern", comments: "conditions_comments" },
        ].map((item) => (
          <div key={item.label}>
            <label style={{ fontWeight: "bold", fontSize: "1.2rem" }}>{item.label}</label>

            <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
              <label>
                <input
                  type="checkbox"
                  name={item.safe}
                  checked={form[item.safe]}
                  onChange={handleChange}
                />{" "}
                Safe
              </label>

              <label>
                <input
                  type="checkbox"
                  name={item.concern}
                  checked={form[item.concern]}
                  onChange={handleChange}
                />{" "}
                Concern
              </label>
            </div>

            <textarea
              name={item.comments}
              value={form[item.comments]}
              onChange={handleChange}
              placeholder="Comments"
              style={{
                width: "100%",
                padding: "0.6rem",
                marginTop: "0.5rem",
                borderRadius: "6px",
                border: "1px solid #ccc",
                height: "70px",
              }}
            />
          </div>
        ))}

        {/* TEAM MEMBER ENGAGEMENT QUESTIONS */}
        <div>
          <label style={{ fontWeight: "bold" }}>
            What is/could be unsafe about the activity YOU are doing?
          </label>
          <textarea
            name="unsafe_about_activity"
            value={form.unsafe_about_activity}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "0.6rem",
              marginTop: "0.3rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
              height: "80px",
            }}
          />
        </div>

        <div>
          <label style={{ fontWeight: "bold" }}>
            What have YOU done to promote safety today?
          </label>
          <textarea
            name="promote_safety"
            value={form.promote_safety}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "0.6rem",
              marginTop: "0.3rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
              height: "80px",
            }}
          />
        </div>

        {/* COMMENTS */}
        <div>
          <label style={{ fontWeight: "bold" }}>Team Member Comments</label>
          <textarea
            name="team_member_comments"
            value={form.team_member_comments}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "0.6rem",
              marginTop: "0.3rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
              height: "80px",
            }}
          />
        </div>

        <div>
          <label style={{ fontWeight: "bold" }}>Observer Comments</label>
          <textarea
            name="observer_comments"
            value={form.observer_comments}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "0.6rem",
              marginTop: "0.3rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
              height: "80px",
            }}
          />
        </div>

        {/* FOLLOW-UP CONTACT QUESTION */}
          <div>
            <label style={{ fontWeight: "bold" }}>
              Would you like to receive a follow‑up contact from Safety/Leadership about this observation?
            </label>

            <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
              <label>
                <input
                  type="radio"
                  name="followup_contact"
                  value="yes"
                  checked={form.followup_contact === "yes"}
                  onChange={handleChange}
                />{" "}
                Yes
              </label>

              <label>
                <input
                  type="radio"
                  name="followup_contact"
                  value="no"
                  checked={form.followup_contact === "no"}
                  onChange={handleChange}
                />{" "}
                No
              </label>
            </div>
          </div>

        {/* PHOTO UPLOAD */}
        <div>
          <label style={{ fontWeight: "bold" }}>Upload Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleChange}
            style={{ marginTop: "0.5rem" }}
          />
        </div>

        {/* SUBMIT BUTTON */}
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
          Submit Observation
        </button>
      </form>
    </Layout>
  );
}