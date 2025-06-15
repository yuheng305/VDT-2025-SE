import React from 'react';

const MainContent = ({ projects, activeTab, setActiveTab }) => {
  if (!projects.length) return <div className="p-4">No projects found.</div>;

  return (
    <div className="flex-1 p-4">
      <div className="flex space-x-4 mb-4">
        {projects.map((project, index) => (
          <button
            key={project.id}
            className={`px-4 py-2 rounded ${
              activeTab === index ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
            onClick={() => setActiveTab(index)}
          >
            {project.name}
          </button>
        ))}
      </div>
      <div className="bg-white shadow p-4 rounded">
        <h2 className="text-2xl font-bold mb-4">{projects[activeTab].name}</h2>
        <p><strong>Leader:</strong> {projects[activeTab].leader}</p>
        <p><strong>Start Date:</strong> {projects[activeTab].startDate}</p>
        <p><strong>End Date:</strong> {projects[activeTab].endDate}</p>
        <p><strong>Progress:</strong> {projects[activeTab].progress}%</p>
      </div>
    </div>
  );
};

export default MainContent;