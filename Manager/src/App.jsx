import React, { useState, useEffect } from "react";
import "./App.css";
import { faker } from '@faker-js/faker'; // Per generare dati casuali (npm install @faker-js/faker)
import ProductivityChart from './ProductivityChart';
import DailyProductivityChart from "./DailyProductivityChart";


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


// Funzione per assegnare i livelli di focus (e quindi i colori) in modo prefissato per progetto
const getColorAssignmentForProject = (projectId, numMembers) => {
    let assignment = [];
    if (projectId === 1) {
        assignment = Array(Math.min(numMembers, 3)).fill('low').concat(Array(Math.max(0, Math.min(numMembers - 3, 2))).fill('average')).concat(Array(Math.max(0, numMembers - 5)).fill('deep'));
    } else if (projectId === 2) {
        assignment = Array(Math.min(numMembers, 2)).fill('low').concat(Array(Math.max(0, Math.min(numMembers - 2, 3))).fill('average')).concat(Array(Math.max(0, numMembers - 5)).fill('deep'));
    } else if (projectId === 3) {
        assignment = Array(Math.min(numMembers, 4)).fill('low').concat(Array(Math.max(0, Math.min(numMembers - 4, 1))).fill('average')).concat(Array(Math.max(0, numMembers - 5)).fill('deep'));
    } else {
        const numLow = faker.number.int({ min: 1, max: Math.floor(numMembers / 2) });
        const numAverage = faker.number.int({ min: 0, max: numMembers - numLow - 1 });
        const numDeep = numMembers - numLow - numAverage;
        assignment = Array(numLow).fill('low').concat(Array(numAverage).fill('average')).concat(Array(numDeep).fill('deep'));
    }

    // Assicurati che l'array abbia la lunghezza corretta
    while (assignment.length < numMembers) {
        assignment.push(assignment[assignment.length - 1] || 'average'); // Riempi con l'ultimo colore o 'average'
    }
    return assignment.slice(0, numMembers); // Tronca se è troppo lungo (per sicurezza)
};

function ProjectDetails({ project, onBack }) {
    const productivity = faker.number.int({ min: 60, max: 95 });
    const callsLastWeek = faker.number.int({ min: 20, max: 150 });
    const totalCallDuration = faker.number.int({ min: 300, max: 3600 });

    const teamMembersWithFocus = project.teamMembers.map((member, index) => {
        const colorAssignment = getColorAssignmentForProject(project.id, project.teamMembers.length);
        return {
            ...member,
            focus: colorAssignment[index],
        };
    });

    return (
        <div className="project-details">
            <button className="back-button" onClick={onBack}>
                ← Back to Dashboard
            </button>
            <div className="project-header">
                <h2>{project.name}</h2>
                <p>
                    {`Start Date: ${project.startDate}  `}
                    {project.endDate && `  End Date: ${project.endDate}`}
                </p>
            </div>
            <p className="project-description">{project.description}</p>

            <div className="project-details-container">
                <div className="team-members">
                    <h3>Team Members</h3>
                    <ul>
                        {teamMembersWithFocus.map((member, index) => (
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

export default function Dashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [backendData, setBackendData] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [expandedItemTitle, setExpandedItemTitle] = useState(null);
    const [checkedFiles, setCheckedFiles] = useState({});
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        fetch("/sample-data.json")
            .then((res) => res.json())
            .then((data) => {
                console.log("Dati JSON caricati:", data);
                setBackendData(data);

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
    const recentFiles = backendData ? Object.values(backendData.items).filter((item) => item.relevance_score > backendData.treshold).map((item) => item.title) : [];
    const unusedFiles = backendData ? Object.values(backendData.items).filter((item) => item.relevance_score < backendData.treshold).map((item) => item.title) : [];
    const pastConversations = ["How to fix segmentation fault?", "What is the purpose of CountNumBeds?", "React sidebar toggle example", "Best practices for C++ class design", "Translate error message from g++"];

    const handleCheckboxChange = (title, event) => {
        event.stopPropagation();
        setCheckedFiles(prev => ({ ...prev, [title]: !prev[title] }));
    };

    const handleProjectClick = (projectName) => {
        const project = projectsData.find(p => p.name === projectName);
        if (project) {
            setSelectedProject({ ...project, teamMembers: generateTeamMembers() });
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

            <div className="content-container new-section-container">
                <div className="projects-container">
                    <h2>Stato Avanzamento Progetti</h2>
                    <div className="projects-list">
                        {projectsData.map((project, index) => {
                            let progressBarClass = "progress-bar";
                            if (project.progress < 50) {
                                progressBarClass += " red";
                            } else if (project.progress <= 75) {
                                progressBarClass += " yellow";
                            } else {
                                progressBarClass += " green";
                            }

                            return (
                                <div
                                    key={index}
                                    className="project-item"
                                    onClick={() => handleProjectClick(project.name)}
                                >
                                    <h3>{project.name}</h3>
                                    <div className="progress-bar-container">
                                        <div
                                            className={progressBarClass}
                                            style={{ width: `${project.progress}%` }}
                                        ></div>
                                    </div>
                                    <p>{project.progress}%</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                

                <div className="productivity-container">
                    <div className="combined-charts-container"> {/* Contenitore per i grafici e il titolo */}
                        <h2>Andamento Produttività</h2> {/* Titolo principale ora qui */}
                        <div className="charts"> {/* Nuovo contenitore per i soli grafici */}
                            <div className="monthly-chart-container">
                                <h3>Mensile</h3>
                                <ProductivityChart />
                            </div>
                            <div className="daily-chart-container">
                                <h3>Giornaliera (8:00 - 18:00)</h3>
                                <DailyProductivityChart />
                            </div>
                        </div>
                    </div>
                    

                    <div className="bottom-widgets-container">
                        <div className="call-suggestion-widget">
                            <p>Suggerisco di distribuire meglio le chiamate nell'arco della giornata considerando i livelli di focus delle diverse persone all'interno dei team, così da non impattare eccessivamente la loro produttività.</p>
                        </div>
                        <div className="loss-estimation-widget">
                            <p>
                                Stima perdita per distrazioni:
                                <span className="loss-amount">
                                    ${1250.50.toFixed(2)}
                                </span>
                            </p>
                        </div>
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
                                                onClick={() => setExpandedItemTitle(isExpanded ? null : item.title)}
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

