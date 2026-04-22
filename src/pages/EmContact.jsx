import { useState } from "react";
import Layout from "../components/Layout";

export default function EmergencyContacts() {
  const inHouseContacts = [
    {
      name: "Bridgette Butler",
      title: "Safety Manager",
      phone: "(918) 629-9373",
      img: "/public/bridgette.jpg", // placeholder
    },
    {
      name: "Todd Carlson",
      title: "Plant Manager",
      phone: "(918) 348-9300",
      img: "/public/todd.jpg",
    },
    {
      name: "Octavio Suarez",
      title: "Technical Director",
      phone: "(918) 770-6035",
      img: "/public/octavio.jpg",
    },
    {
      name: "Kyle Anderson",
      title: "Maintenance Manager",
      phone: "(918) 351-4656",
      img: "/public/kyle.jpg",
    },
    {
      name: "Homero Valencia",
      title: "Press Maintenance Manager",
      phone: "(918) 537-0467",
      img: "/public/logo2.jpg",
    },
    {
      name: "Luz Aguero",
      title: "Human Resources Manager",
      phone: "(972) 345-7740",
      img: "/public/luz.jpg",
    },
  ];

  const externalContacts = [
    { name: "Ambulance", emergency: "911", nonEmergency: "(918) 683-0108" },
    { name: "Muskogee Police", emergency: "911", nonEmergency: "(918) 683-8000" },
    { name: "Muskogee Fire", emergency: "911", nonEmergency: "(918) 682-1313" },
    { name: "Muskogee Immediate Care Doctor Inbox", phone: "(918) 682-0721" },
    { name: "Muskogee Hospital", phone: "(918) 684-2151" },
    { name: "OG&E Power Outages", phone: "(800) 550-4643" },
    { name: "ONG (Gas Co.)", phone: "(800) 458-4251" },
    { name: "Railroad", phone: "(918) 682-1661" },
  ];

  return (
    <Layout>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem", color: "#b30000" }}>
        Emergency Contact Directory
      </h1>

      <p style={{ fontSize: "1.1rem", marginBottom: "2rem" }}>
        This page provides quick access to critical emergency contacts for
        Dal‑Tile Muskogee. In‑house leadership contacts are listed first,
        followed by external emergency services.
      </p>

      {/* IN-HOUSE CONTACTS */}
      <h2 style={{ color: "#b30000", marginBottom: "1rem" }}>In‑House Contacts</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        {inHouseContacts.map((c, index) => (
          <div
            key={index}
            style={{
              backgroundColor: "#fff",
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "1rem",
              textAlign: "center",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            {/* Headshot Placeholder */}
            <div
              style={{
                width: "100%",
                height: "150px",
                backgroundColor: "#f0f0f0",
                borderRadius: "6px",
                marginBottom: "1rem",
                overflow: "hidden",
              }}
            >
              <img
                src={c.img}
                alt={c.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>

            <h3 style={{ margin: "0.5rem 0", color: "#b30000" }}>{c.name}</h3>
            <p style={{ margin: "0.2rem 0", fontWeight: "bold" }}>{c.title}</p>
            <p style={{ margin: "0.2rem 0" }}>Cell: {c.phone}</p>
          </div>
        ))}
      </div>

      {/* EXTERNAL CONTACTS */}
      <h2 style={{ color: "#b30000", marginBottom: "1rem" }}>
        External Emergency Services
      </h2>

      <div
        style={{
          backgroundColor: "#fff",
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "1rem",
          marginBottom: "2rem",
        }}
      >
        {externalContacts.map((c, index) => (
          <div
            key={index}
            style={{
              padding: "0.8rem 0",
              borderBottom: index !== externalContacts.length - 1 ? "1px solid #eee" : "none",
            }}
          >
            <strong>{c.name}</strong>
            <div style={{ marginTop: "0.3rem" }}>
              {c.emergency && (
                <p style={{ margin: "0.2rem 0" }}>
                  Emergency: <strong>{c.emergency}</strong>
                </p>
              )}
              {c.nonEmergency && (
                <p style={{ margin: "0.2rem 0" }}>
                  Non‑Emergency: {c.nonEmergency}
                </p>
              )}
              {c.phone && (
                <p style={{ margin: "0.2rem 0" }}>Phone: {c.phone}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
