import React, { useState, useEffect } from "react";
import "./App.css";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [backendData, setBackendData] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [expandedItemTitle, setExpandedItemTitle] = useState(null);
  // Add state to track checked files
  const [checkedFiles, setCheckedFiles] = useState({});

  useEffect(() => {
    fetch("/sample-data.json")
      .then((res) => res.json())
      .then((data) => {
        console.log("Dati JSON caricati:", data);
        setBackendData(data);
        
        // Initialize all files as checked
        const initialCheckedState = {};
        Object.values(data.items).forEach(item => {
          initialCheckedState[item.title] = true;
        });
        setCheckedFiles(initialCheckedState);
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

  // Handle checkbox change
  const handleCheckboxChange = (title, event) => {
    // Stop propagation to prevent expanding/collapsing when clicking checkbox
    event.stopPropagation();
    
    setCheckedFiles(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  return (
    <div className="dashboard">
      {/* Sidebar toggle button */}
      <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <span className="hamburger-icon"></span>
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>Last conversation with AI</h2>
          <button className="close-btn" onClick={() => setSidebarOpen(false)}>
            ✕
          </button>
        </div>
        <ul className="conversation-list">
          {pastConversations.map((item, index) => (
            <li key={index}>
              <div className="conversation-item">
                <span className="conversation-icon">💬</span>
                <span className="conversation-text">{item}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Main content */}
      <div className="content-container">
        <div className="top-section">
          <div className="task-box">
            <img src="/Owl.png" alt="Suggerimento" className="suggestion-icon" />
            <h1>Hi Giuse, you were working on:</h1>
            <ul className="task-list">
              you were working on analyzing system performance and reliability. You focused on code quality, benchmarks, security, and compliance. You also checked API usage, memory stats, user feedback, and deployment logs to spot issues and optimize things. Looks like you're getting ready for a major review or release.
            </ul>
          </div>
        </div>

        <div className="files-section">
          <div className="file-box">
            <div className="file-box-header">
              <h2>Recently used files</h2>
            </div>
            <ul className="file-list">
              {backendData &&
                Object.values(backendData.items)
                  .filter((item) => item.relevance_score > backendData.treshold)
                  .map((item) => {
                    const isExpanded = expandedItemTitle === item.title;
                    return (
                      <li key={item.title} className="file-item">
                        <div
                          className="file-item-header"
                          onClick={() =>
                            setExpandedItemTitle(isExpanded ? null : item.title)
                          }
                        >
                          <div className="file-name">
                            <span className="file-icon">📄</span>
                            <span>{item.title}</span>
                          </div>
                          <a
                            href={item.path_or_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="file-path"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {item.path_or_link}
                          </a>
                        </div>
                        {isExpanded && (
                          <div className="file-item-details">
                            {item.description}
                          </div>
                        )}
                      </li>
                    );
                  })}
            </ul>
          </div>

          <div className="file-box">
            <div className="file-box-header">
              <h2>Unused files</h2>
            </div>
            <ul className="file-list">
              {backendData &&
                Object.values(backendData.items)
                  .filter((item) => item.relevance_score < backendData.treshold)
                  .map((item) => {
                    const isExpanded = expandedItemTitle === item.title;
                    return (
                      <li key={item.title} className="file-item">
                        <div
                          className="file-item-header"
                        >
                          <div 
                            className="file-name"
                            onClick={(e) => {
                              // Evita che il click sulla casella di spunta espanda la voce
                              if (!e.target.classList.contains('file-checkbox')) {
                                setExpandedItemTitle(isExpanded ? null : item.title);
                              }
                            }}
                          >
                            <span className="file-checkbox-container">
                              <input 
                                type="checkbox"
                                className="file-checkbox"
                                checked={checkedFiles[item.title] || false}
                                onChange={(e) => handleCheckboxChange(item.title, e)}
                              />
                            </span>
                            <span>{item.title}</span>
                          </div>
                          <a
                            href={item.path_or_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="file-path"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {item.path_or_link}
                          </a>
                        </div>
                        {isExpanded && (
                          <div className="file-item-details">
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
      </div>

      {/* Overlay popup */}
      {selectedItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="modal-close-btn"
              onClick={() => setSelectedItem(null)}
            >
              ✕
            </button>
            <h3 className="modal-title">{selectedItem.title}</h3>
            <p className="modal-description">{selectedItem.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}