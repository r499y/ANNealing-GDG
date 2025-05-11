import React, { useState, useEffect } from "react";
import "./App.css";
import { faker } from '@faker-js/faker'; // Per generare dati casuali (npm install @faker-js/faker)

const projectsData = [  // Dati di esempio per i progetti
    { name: "Progetto 1", progress: 75, startDate: "2024-01-15", endDate: "2024-03-30", description: "Sviluppo nuova funzionalità X" },
    { name: "Progetto 2", progress: 40, startDate: "2024-02-01", endDate: "2024-04-15", description: "Rifattorizzazione del modulo Y" },
    { name: "Progetto 3", progress: 90, startDate: "2024-03-15", endDate: "2024-05-30", description: "Integrazione con API esterna Z" },
    { name: "Progetto 4", progress: 25, startDate: "2024-04-01", endDate: "2024-06-15", description: "Ottimizzazione delle performance" },
    { name: "Progetto 5", progress: 60, startDate: "2024-05-15", endDate: "2024-07-30", description: "Creazione di un nuovo servizio" },
    { name: "Progetto 6", progress: 80, startDate: "2024-06-01", endDate: "2024-08-15", description: "Correzione bug critici" },
];

function generateTeamMembers() {
    const numMembers = faker.number.int({ min: 5, max: 12 });
    const members = [];
    for (let i = 0; i < numMembers; i++) {
        members.push({
            name: faker.person.fullName(),
            focus: i < 2 ? 'low' : i < numMembers - 2 ? 'average' : 'deep',
        });
    }
    return members;
}

export default function Dashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [backendData, setBackendData] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [expandedItemTitle, setExpandedItemTitle] = useState(null);
    const [checkedFiles, setCheckedFiles] = useState({});
    const [selectedItem, setSelectedItem] = useState(null); // Assicurati che selectedItem sia definito

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

    const handleCheckboxChange = (title, event) => {
        event.stopPropagation();
        setCheckedFiles(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

    const handleProjectClick = (projectName) => {
        const project = projectsData.find(p => p.name === projectName);
        if (project) {
            setSelectedProject({ ...project, teamMembers: generateTeamMembers() }); // Aggiungi membri del team
        }
    };

    const handleBackToDashboard = () => {
        setSelectedProject(null);
    };

    if (selectedProject) {
        return <ProjectDetails project={selectedProject} onBack={handleBackToDashboard} />;
    }

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
            <div className="content-container new-section-container">
                <div className="projects-container">
                    <h2>Stato Avanzamento Progetti</h2>
                    <div className="projects-list">
                        {projectsData.map((project, index) => (
                            <div
                                key={index}
                                className="project-item"
                                onClick={() => handleProjectClick(project.name)}
                            >
                                <h3>{project.name}</h3>
                                <div className="progress-bar-container">
                                    <div
                                        className="progress-bar"
                                        style={{ width: `${project.progress}%` }}
                                    ></div>
                                </div>
                                <p>{project.progress}%</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="productivity-container">
                    <div className="chart-container" > {/* Ho rimosso onClick qui, lo avevamo messo solo come esempio */}
                        <h2>Andamento Produttività Generale</h2>
                        {/* Qui andrà il componente del grafico (es. da Chart.js) */}
                        <div className="chart-placeholder">Grafico qui</div>
                    </div>
                    <div className="loss-estimation">
                        <p>
                            Stima perdita per distrazioni:
                            <span className="loss-amount">
                                 ${1250.50.toFixed(2)} {/* Ho messo un valore statico di esempio */}
                            </span>
                        </p>
                    </div>
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
    );
}

function ProjectDetails({ project, onBack }) {
    const productivity = faker.number.int({ min: 60, max: 95 });
    const callsLastWeek = faker.number.int({ min: 20, max: 150 });
    const totalCallDuration = faker.number.int({ min: 300, max: 3600 }); // In seconds

    // Function to assign focus levels
    const assignFocusLevels = (members) => {
        const focusLevels = ['deep', 'average', 'low'];
        let levelIndex = 0;
        return members.map((member, index) => {
            const updatedMember = {
                ...member,
                focus: focusLevels[levelIndex]
            };
            levelIndex = (levelIndex + 1) % focusLevels.length; // Cycle through levels
            return updatedMember;
        });
    };

    const membersWithFocus = assignFocusLevels(project.teamMembers);

    return (
        <div className="project-details">
            <button className="back-button" onClick={onBack}>
                ← Back to Dashboard
            </button>
            <div className="project-header">
                <h2>{project.name}</h2>
                <p>
                    {`Start Date: ${project.startDate}  `}
                    {project.endDate && `  End Date: ${project.endDate}`}
                </p>
            </div>
            <p className="project-description">{project.description}</p>

            <div className="project-details-container">
                <div className="team-members">
                    <h3>Team Members</h3>
                    <ul>
                        {membersWithFocus.map((member, index) => (
                            <li key={index} className={`member-${member.focus}`}>
                                {member.name}
                                <span className={`focus-indicator ${member.focus}-focus`}></span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="productivity-report">
                    <h3>Productivity Report</h3>
                    <p>Productivity: {productivity}%</p>
                    <div className="call-stats">
                        <p>Calls Last Week: {callsLastWeek}</p>
                        <p>Total Call Duration: {Math.floor(totalCallDuration / 60)} minutes</p>
                    </div>
                    <p className="team-comment">
                        {faker.lorem.sentence()}
                    </p>
                </div>
            </div>
        </div>
    );
}