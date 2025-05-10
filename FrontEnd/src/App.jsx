import React, { useState, useEffect } from "react";
import "./App.css";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [backendData, setBackendData] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [expandedItemTitle, setExpandedItemTitle] = useState(null);


  useEffect(() => {
    fetch("/sample-data.json")
      .then((res) => res.json())
      .then((data) => {
        console.log("Dati JSON caricati:", data);
        setBackendData(data);
      })
      .catch((err) => {
        console.error("Errore nel caricamento del file JSON:", err);
      });
  }, []);

  const tasks = [backendData?.general_overview];

  const recentFiles = backendData
    ? Object.values(backendData.items)
        .filter((item) => item.relevance_score > backendData.treshold)
        .map((item) => item.title)
    : [];

  const unusedFiles = backendData
    ? Object.values(backendData.items)
        .filter((item) => item.relevance_score < backendData.treshold)
        .map((item) => item.title)
    : [];

  const pastConversations = [
    "How to fix segmentation fault?",
    "What is the purpose of CountNumBeds?",
    "React sidebar toggle example",
    "Best practices for C++ class design",
    "Translate error message from g++",
  ];

  return (
    <div className="dashboard">
      {/* Sidebar toggle button */}
      <button className="tiny-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
        Button
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>Last conversation with AI</h2>
          <button className="close-btn" onClick={() => setSidebarOpen(false)}>
            ✕
          </button>
        </div>
        <ul>
          {pastConversations.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Main content */}
      <div className="top-section">
        <div className="task-box">
          <h1>Hi Giuse, you were working on:</h1>
          <ul>
            {tasks.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="files-section">
        <div className="file-box">
          <h2>Recently used files:</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
  {backendData &&
    Object.values(backendData.items)
      .filter((item) => item.relevance_score > backendData.treshold)
      .map((item) => {
        const isExpanded = expandedItemTitle === item.title;
        return (
          <li
            key={item.title}
            style={{
              color: "#9CDCFE",
              padding: "8px 0",
              borderBottom: "1px solid #2d2d2e",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
              }}
              onClick={() =>
                setExpandedItemTitle(isExpanded ? null : item.title)
              }
            >
              <span>{item.title}</span>
              <a
                href={item.path_or_link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: "12px",
                  color: "#d7ba7d",
                  textDecoration: "none",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {item.path_or_link}
              </a>
            </div>

            {isExpanded && (
              <div
                style={{
                  marginTop: "6px",
                  fontSize: "13px",
                  color: "#cccccc",
                  paddingLeft: "8px",
                }}
              >
                {item.description}
              </div>
            )}
          </li>
        );
      })}
</ul>


        </div>

        <div className="file-box">
          <h2>Unused files:</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
  {backendData &&
    Object.values(backendData.items)
      .filter((item) => item.relevance_score > backendData.treshold)
      .map((item) => {
        const isExpanded = expandedItemTitle === item.title;
        return (
          <li
            key={item.title}
            style={{
              color: "#9CDCFE",
              padding: "8px 0",
              borderBottom: "1px solid #2d2d2e",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
              }}
              onClick={() =>
                setExpandedItemTitle(isExpanded ? null : item.title)
              }
            >
              <span>{item.title}</span>
              <a
                href={item.path_or_link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: "12px",
                  color: "#d7ba7d",
                  textDecoration: "none",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {item.path_or_link}
              </a>
            </div>

            {isExpanded && (
              <div
                style={{
                  marginTop: "6px",
                  fontSize: "13px",
                  color: "#cccccc",
                  paddingLeft: "8px",
                }}
              >
                {item.description}
              </div>
            )}
          </li>
        );
      })}
</ul>
        </div>
      </div>

      <div className="button-container">
        <button className="main-btn">Accept reorder</button>
      </div>

      {/* Overlay popup */}
      {selectedItem && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#1e1e1e",
              color: "#D4D4D4",
              border: "1px solid #9CDCFE",
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "500px",
              width: "90%",
              position: "relative",
            }}
          >
            <button
              onClick={() => setSelectedItem(null)}
              style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                background: "none",
                border: "none",
                color: "#ffffff",
                fontSize: "18px",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
            <h3>{selectedItem.title}</h3>
            <p>{selectedItem.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}
