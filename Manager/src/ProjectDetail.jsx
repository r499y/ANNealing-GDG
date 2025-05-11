import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './App.css'; // Assicurati che il percorso sia corretto

const ProjectDetails = ({ projects }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const project = projects.find(p => p.id === parseInt(id));

    if (!project) {
        return <div>Progetto non trovato.</div>;
    }
     const getColorAssignmentForProject = (projectId) => {
        // Questa è solo una logica di esempio, potresti renderla più "casuale" ma deterministica
        if (projectId === 1) {
            return ['low', 'low', 'average', 'deep', 'low'];
        } else if (projectId === 2) {
            return ['low', 'average', 'average', 'deep', 'deep', 'deep'];
        } else if (projectId === 3) {
            return ['low', 'low', 'low', 'average', 'average', 'deep'];
        }
        // ... altri casi per altri progetti
        return ['low', 'average', 'deep']; // Valore predefinito
    };

    // E INSERISCI QUI L'ASSEGNAZIONE DI colorAssignment
    const colorAssignment = getColorAssignmentForProject(project.id);

   

    const teamMembersWithFocus = project.teamMembers.map((member, index) => ({
        ...member,
        focusLevel: colorAssignment[index % colorAssignment.length], // Assegna il colore in base all'ordine
    }));

    const handleBackClick = () => {
        navigate('/dashboard');
    };

    return (
        <div className="project-details">
            <button className="back-button" onClick={handleBackClick}>
                &larr; Back to Dashboard
            </button>
            <div className="project-header">
                <h2>{project.name}</h2>
                <p>Start Date: {project.startDate} End Date: {project.endDate}</p>
            </div>
            <p className="project-description">{project.description}</p>
            <div className="project-details-container">
                <div className="team-members">
                    <h3>Team Members</h3>
                    <ul>
                        {teamMembersWithFocus.map(member => (
                            <li key={member.name} className={`member-${member.focusLevel}`}>
                                {member.name}
                                <span className="focus-indicator"></span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="productivity-report">
                    <h3>Productivity Report</h3>
                    <p>Productivity: {project.productivity}%</p>
                    <p>Calls Last Week: {project.callsLastWeek}</p>
                    <p>Total Call Duration: {project.totalCallDuration} minutes</p>
                    <p>{project.productivityDetails}</p>
                </div>
            </div>
            {/* ... (altre sezioni se presenti) ... */}
        </div>
    );
};

export default ProjectDetails;