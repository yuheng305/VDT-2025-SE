import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchUserData, fetchProjects, fetchProjectDetails, fetchPTAssignments, fetchLeader } from '../api';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import TaskAssignmentTable from '../components/TaskAssignmentTable';
import FileUpload from '../components/FileUpload';
import { Chart } from 'react-google-charts';
import Modal from 'react-modal';
import { logout } from '../api'; 

Modal.setAppElement('#root'); 

const ProjectDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get projectId from URL parameter
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [project, setProject] = useState(null);
  const [taskAssignments, setTaskAssignments] = useState([]);
  const [leader, setLeader] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isGanttModalOpen, setIsGanttModalOpen] = useState(false); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userData = await fetchUserData();
        setUser(userData);

        const fetchedProjects = await fetchProjects(userData.id);
        setProjects(fetchedProjects);

        let projectIdToUse = id ? parseInt(id) : fetchedProjects[0]?.id; 
        if (!projectIdToUse && fetchedProjects.length > 0) {
          projectIdToUse = fetchedProjects[0].id;
          navigate(`/project-details/${projectIdToUse}`); 
        } else if (!projectIdToUse) {
          navigate('/');
          return;
        }

        // Find the active tab based on the projectId
        const projectIndex = fetchedProjects.findIndex(project => project.id === projectIdToUse);
        if (projectIndex !== -1) {
          setActiveTab(projectIndex);

          const details = await fetchProjectDetails(projectIdToUse);
          setProject(details);

          const tasksResponse = await fetchPTAssignments(projectIdToUse);
          setTaskAssignments(tasksResponse.task_assignments || []);

          if (details.leader_id) {
            const leaderData = await fetchLeader(details.leader_id);
            setLeader(leaderData);
          }
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]); // Depend on id to refetch when URL changes

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  const handleTabChange = async (index) => {
    setActiveTab(index);
    const projectId = projects[index]?.id;
    if (projectId) {
      try {
        navigate(`/project-details/${projectId}`); // Update URL when tab changes
        const details = await fetchProjectDetails(projectId);
        setProject(details);
        const tasksResponse = await fetchPTAssignments(projectId);
        setTaskAssignments(tasksResponse.task_assignments || []);
        if (details.leader_id) {
          const leaderData = await fetchLeader(details.leader_id);
          setLeader(leaderData);
        }
      } catch (error) {
        console.error('Lỗi khi thay đổi tab:', error);
      }
    }
  };

  const ganttData = [
    [
      { type: 'string', label: 'Task ID' },
      { type: 'string', label: 'Task Name' },
      { type: 'date', label: 'Start Date' },
      { type: 'date', label: 'End Date' },
      { type: 'number', label: 'Duration' },
      { type: 'number', label: 'Percent Complete' },
      { type: 'string', label: 'Dependencies' },
    ],
    ...taskAssignments.map((task) => [
      task.id.toString(),
      task.task_name,
      new Date(task.start_date),
      new Date(task.due_date),
      null,
      task.progress,
      null,
    ]),
  ];

  if (loading) return <div className="flex justify-center items-center min-h-screen bg-[#f0f6ff]">Loading...</div>;

  if (!project || projects.length === 0) return <div className="flex justify-center items-center min-h-screen bg-[#f0f6ff]">No projects found.</div>;

  return (
    <div className="flex min-h-screen bg-[#f0f6ff]">
      <Sidebar isOpen={isSidebarOpen} />
      <div className={`flex-1 flex flex-col `}>
        <Header
          user={user}
          onLogout={handleLogout}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div className={`flex-1 p-6 pt-24 ${isSidebarOpen ? 'ml-64' : 'ml-0'} transition-all duration-300`}>
          <div className="flex justify-between items-center mb-6">
            <div className="relative flex space-x-2">
              {projects.map((project, index) => (
                <button
                  key={project.id}
                  className={`px-4 py-1 rounded-lg text-sm font-medium transition-all duration-300 ${
                    activeTab === index
                      ? 'bg-red-600 text-white shadow-md transform translate-y-1 z-10'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                  }`}
                  style={{
                    marginLeft: index === 0 ? '0' : '-10px',
                    zIndex: projects.length - index,
                  }}
                  onClick={() => handleTabChange(index)}
                >
                  {project.project_name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-2xl font-bold mb-4">Project Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <p><strong>Project Name:</strong> {project.project_name}</p>
              <p><strong>Leader:</strong> Huy Nguyễn Quang</p>
              <p><strong>Start Date:</strong> {new Date(project.start_date).toLocaleDateString('vi-VN')}</p>
              <p><strong>End Date:</strong> {new Date(project.end_date).toLocaleDateString('vi-VN')}</p>
            </div>
            <p className="mt-4"><strong>Description:</strong> {project.project_description || 'No description available'}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Tasks List</h3>
            <FileUpload projectId={projects[activeTab]?.id} onTaskUpdate={(newTasks) => setTaskAssignments(newTasks)} />
            <TaskAssignmentTable taskAssignments={taskAssignments} projectId={projects[activeTab]?.id} />

            <div className="mt-6">
              <button
                onClick={() => setIsGanttModalOpen(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Show Gantt Chart
              </button>
            </div>
          </div>

          <Modal
            isOpen={isGanttModalOpen}
            onRequestClose={() => setIsGanttModalOpen(false)}
            style={{
              content: {
                top: '50%',
                left: '50%',
                right: 'auto',
                bottom: 'auto',
                marginRight: '-50%',
                transform: 'translate(-50%, -50%)',
                width: '90%',
                maxWidth: '900px',
                height: 'auto',
                padding: '20px',
                overflow: 'auto',
              },
              overlay: {
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
              },
            }}
            contentLabel="Gantt Chart Modal"
          >
            <h3 className="text-xl font-bold mb-4">Gantt Chart</h3>
            <Chart
              width={'100%'}
              height={'100%'}
              chartType="Gantt"
              loader={<div>Loading Chart</div>}
              data={ganttData}
              options={{
                height: '100%',
                gantt: {
                  trackHeight: 30,
                  defaultStartDateMillis: new Date(project.start_date).getTime(),
                },
              }}
            />
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setIsGanttModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;