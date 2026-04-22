import { useState } from "react";
import Layout from "../components/Layout";

export default function SafetyQuiz() {
  // Flashcard modal state
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  // Q&A pulled from your document
  const qaList = [
    { q: "What does VPP mean?", a: "Voluntary Protection Program." },
    { q: "Why does Dal-Tile partner with OSHA/VPP?", a: "Helps promote the value of safety and health in the workplace." },
    { q: "Is Dal-Tile Muskogee a VPP Star Facility?", a: "Yes. Star recognition is for exemplary achievement in safety and health management systems." },
    { q: "How do leaders support your safety concerns/needs on the floor?", a: "Document teammate feedback." },
    { q: "Do teammates feel free to participate in safety programs without fear of retaliation?", a: "Yes. Document teammate feedback." },
    { q: "What safety programs can teammates participate in?", a: "BBS, Plant Meetings, Steering/Safety Committees." },
    { q: "How do teammates support VPP daily?", a: "By following safe practices and participating in safety programs." },
    { q: "What do we do in an active shooter situation?", a: "Call on radio, then Run, Hide, Fight." },
    { q: "Where is battery changing PPE?", a: "At all battery change stations." },
    { q: "Can you conduct hot work near a battery changing area?", a: "No." },
    { q: "When are wheel chocks used?", a: "Anytime a dock lock is not used." },
    { q: "What do red/green dock lock lights mean?", a: "Red = not secured. Green = safe to enter." },
    { q: "Safe practices entering/exiting trailers?", a: "Look in direction of travel and honk horn." },
    { q: "How far should a ladder extend above a roof?", a: "At least 3 feet." },
    { q: "Can you place a ladder in front of doors?", a: "Yes, but the door must be blocked off." },
    { q: "Can ladders be modified?", a: "No." },
    { q: "How often is atmosphere monitored in confined space entry?", a: "Continuously and recorded every 15 minutes." },
    { q: "When should an attendant order evacuation?", a: "Any hazardous atmospheric change or emergency." },
    { q: "What PPE is required when working inside an electrical panel?", a: "Appropriate PPE and test-before-touch." },
    { q: "When is fall protection required?", a: "Anytime working above 4 feet without protection or in a man lift." },
    { q: "What type of lock is used for LOTO?", a: "Red LOTO lock with one key." },
    { q: "How do you verify equipment is locked out?", a: "Attempt to start equipment (test)." },
    { q: "How do you shut down equipment in an emergency?", a: "Press E-Stop or pull E-Cord." },
    { q: "Who can work on chains/gears?", a: "Maintenance only under LOTO." },
    { q: "How far must pedestrians stay from PIT?", a: "3 feet." },
    { q: "What should you do if your front view is obstructed on a lift?", a: "Drive in reverse." },
    { q: "When should PIT lights be on?", a: "Anytime PIT is in operation." },
    { q: "When are cut-resistant gloves required?", a: "Anytime fired tile is handled." },
    { q: "When are chemical gloves required?", a: "When changing LP tanks and batteries." },
    { q: "When are steel toe boots required?", a: "Always unless working in glaze lines." },
  ];

  // Flashcard controls
  const nextCard = () => {
    setShowAnswer(false);
    setCurrentIndex((prev) => (prev + 1) % qaList.length);
  };

  const prevCard = () => {
    setShowAnswer(false);
    setCurrentIndex((prev) =>
      prev === 0 ? qaList.length - 1 : prev - 1
    );
  };

  return (
    <Layout>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem", color: "#b30000" }}>
        Safety Knowledge & Quiz Center
      </h1>

      <p style={{ fontSize: "1.1rem", marginBottom: "1.5rem" }}>
        Review key safety questions and answers below. When you're ready, use the
        Flashcard Trainer to test your knowledge.
      </p>

      {/* Flashcard Button */}
      <button
        onClick={() => setShowFlashcards(true)}
        style={{
          padding: "0.7rem 1.2rem",
          backgroundColor: "#b30000",
          color: "white",
          border: "none",
          borderRadius: "6px",
          fontSize: "1rem",
          fontWeight: "bold",
          cursor: "pointer",
          marginBottom: "2rem",
        }}
      >
        Start Flashcard Trainer
      </button>

      {/* Static Q&A List */}
      <div>
        {qaList.map((item, index) => (
          <div
            key={index}
            style={{
              backgroundColor: index % 2 === 0 ? "#f7f7f7" : "#ffffff",
              padding: "1rem",
              borderRadius: "6px",
              marginBottom: "1rem",
              border: "1px solid #ddd",
            }}
          >
            <strong>Q: {item.q}</strong>
            <p style={{ marginTop: "0.5rem" }}>A: {item.a}</p>
          </div>
        ))}
      </div>

      {/* Flashcard Modal */}
      {showFlashcards && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "2rem",
              borderRadius: "10px",
              width: "90%",
              maxWidth: "500px",
              textAlign: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}
          >
            <h2 style={{ marginBottom: "1rem", color: "#b30000" }}>
              Flashcard Trainer
            </h2>

            <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
              {qaList[currentIndex].q}
            </p>

            {showAnswer && (
              <p
                style={{
                  marginTop: "1rem",
                  fontSize: "1.1rem",
                  backgroundColor: "#f0f0f0",
                  padding: "1rem",
                  borderRadius: "6px",
                }}
              >
                {qaList[currentIndex].a}
              </p>
            )}

            <div style={{ marginTop: "1.5rem" }}>
              {!showAnswer && (
                <button
                  onClick={() => setShowAnswer(true)}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#0077b3",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    marginRight: "0.5rem",
                    cursor: "pointer",
                  }}
                >
                  Show Answer
                </button>
              )}

              {showAnswer && (
                <button
                  onClick={nextCard}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    marginRight: "0.5rem",
                    cursor: "pointer",
                  }}
                >
                  Next
                </button>
              )}

              <button
                onClick={prevCard}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#555",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  marginRight: "0.5rem",
                  cursor: "pointer",
                }}
              >
                Previous
              </button>

              <button
                onClick={() => setShowFlashcards(false)}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#b30000",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
