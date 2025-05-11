import React, { useState, useEffect } from "react";
import "./App.css";
import ProductivityChart from './ProductivityChart';
import DailyProductivityChart from "./DailyProductivityChart";

function getColorAssignmentForProject(projectId, numMembers) {
    let assignment = [];
    if (projectId === 1) {
        assignment = Array(Math.min(numMembers, 3)).fill('low')
            .concat(Array(Math.max(0, Math.min(numMembers - 3, 2))).fill('average'))
            .concat(Array(Math.max(0, numMembers - 5)).fill('deep'));
    } else if (projectId === 2) {
        assignment = Array(Math.min(numMembers, 2)).fill('low')
            .concat(Array(Math.max(0, Math.min(numMembers - 2, 3))).fill('average'))
            .concat(Array(Math.max(0, numMembers - 5)).fill('deep'));
    } else if (projectId === 3) {
        assignment = Array(Math.min(numMembers, 4)).fill('low')
            .concat(Array(Math.max(0, Math.min(numMembers - 4, 1))).fill('average'))
            .concat(Array(Math.max(0, numMembers - 5)).fill('deep'));
    } else {
        const numLow = Math.floor(Math.random() * (Math.floor(numMembers / 2))) + 1;
        const numAverage = Math.floor(Math.random() * (numMembers - numLow));
        const numDeep = numMembers - numLow - numAverage;
        assignment = Array(numLow).fill('low')
            .concat(Array(numAverage).fill('average'))
            .concat(Array(numDeep).fill('deep'));
    }

    while (assignment.length < numMembers) {
        assignment.push(assignment[assignment.length - 1] || 'average');
    }
    return assignment.slice(0, numMembers);
}

function ProjectDetails({ project, onBack }) {
    const productivity = project.productivity;
    const callsLastWeek = project.weekly_calls;
    const totalCallDuration = project.call_hours_total * 60;

    const teamMembersWithFocus = project.teamMembers.map((member, index) => {
        const colorAssignment = getColorAssignmentForProject(project.id || 0, project.teamMembers.length);
        return {
            ...member,
            focus: colorAssignment[index],
        };
    });

    return (
        <div className="project-details">
            <button className="back-button" onClick={onBack}>← Back to Dashboard</button>
            <div className="project-header">
                <h2>{project.name}</h2>
                <p>Start Date: {project.start_date}   End Date: {project.end_date_estimated}</p>
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
                    <p>Productivity: {productivity}</p>
                    <div className="call-stats">
                        <p>Calls Last Week: {callsLastWeek}</p>
                        <p>Total Call Duration: {Math.floor(totalCallDuration)} minutes</p>
                    </div>
                    <p className="team-comment">{project.productivity_comment}</p>
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

    useEffect(() => {
        fetch("/sample-data.json")
            .then((res) => res.json())
            .then((data) => {
                console.log("Dati JSON caricati:", data);
                setBackendData(data);
                const initialCheckedState = {};
                if (data.items) {
                    Object.values(data.items).forEach(item => {
                        initialCheckedState[item.title] = true;
                    });
                }
                setCheckedFiles(initialCheckedState);
            })
            .catch((err) => {
                console.error("Errore nel caricamento del file JSON:", err);
            });
    }, []);

    const handleCheckboxChange = (title, event) => {
        event.stopPropagation();
        setCheckedFiles(prev => ({ ...prev, [title]: !prev[title] }));
    };

    const handleProjectClick = (projectName) => {
        const project = backendData?.projects?.find(p => p.name === projectName);
        if (project) {
            const teamMembers = project.collaborators.map(name => ({ name }));
            setSelectedProject({ ...project, teamMembers });
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
                    <h2>Project progress status</h2>
                    <div className="projects-list">
                        {backendData?.projects?.map((project, index) => {
                            let progress = parseInt(project.progress_level);
                            let progressBarClass = "progress-bar";
                            if (progress < 50) {
                                progressBarClass += " red";
                            } else if (progress <= 75) {
                                progressBarClass += " yellow";
                            } else {
                                progressBarClass += " green";
                            }
                            return (
                                <div key={index} className="project-item" onClick={() => handleProjectClick(project.name)}>
                                    <h3>{project.name}</h3>
                                    <div className="progress-bar-container">
                                        <div className={progressBarClass} style={{ width: `${progress}%` }}></div>
                                    </div>
                                    <p>{progress}%</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="productivity-container">
                    <div className="combined-charts-container">
                        <h2>Productivity trends</h2>
                        <div className="charts">
                            <div className="monthly-chart-container">
                                <h3>Month</h3>
                                <ProductivityChart />
                            </div>
                            <div className="daily-chart-container">
                                <h3>Day (8:00 - 18:00)</h3>
                                <DailyProductivityChart />
                            </div>
                        </div>
                    </div>
                    <div className="bottom-widgets-container">
                        <div className="call-suggestion-widget">
                            <img src="/Owl.png" alt="Suggerimento" className="suggestion-icon" />
                            <p>I suggest scheduling calls more evenly throughout the day, taking into account the varying focus levels of team members, in order to minimize the impact on their productivity.</p>
                        </div>
                        <div className="loss-estimation-widget">
                            <p>
                                Estimated financial loss due to distractions: <br/>
                                <span className="loss-amount">${1250.50.toFixed(2)}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
