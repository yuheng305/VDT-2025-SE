import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUserData, fetchProjects, fetchProjectDetails, fetchPTAssignments, fetchProjectTasks, logout, fetchLeader } from '../api';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Chart } from 'react-google-charts';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [projectDetails, setProjectDetails] = useState({});
  const [projectTasksForPie, setProjectTasksForPie] = useState([]);
  const [projectTasksForGantt, setProjectTasksForGantt] = useState([]);
  const [leader, setLeader] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [chartType, setChartType] = useState('Pie Chart');

  const initializeData = async () => {
    try {
      const userData = await fetchUserData();
      console.log('Fetched User Data:', userData);
      if (userData) {
        setUser(userData);
        const fetchedProjects = await fetchProjects(userData.id);
        console.log('Fetched Projects:', fetchedProjects);
        setProjects(fetchedProjects);
        if (fetchedProjects.length > 0) {
          const projectId = fetchedProjects[activeTab]?.id || 1;
          const details = await fetchProjectDetails(projectId);
          console.log('Fetched Project Details:', details);
          
          const tasksForPieResponse = await fetchPTAssignments(projectId);
          console.log('Fetched Tasks for Pie:', tasksForPieResponse);
          const taskAssignments = tasksForPieResponse.task_assignments || [];
          setProjectTasksForPie(taskAssignments);
          
          const totalProgress = taskAssignments.reduce((sum, task) => sum + (task.progress || 0), 0);
          const projectProgress = taskAssignments.length > 0 ? Math.round(totalProgress / taskAssignments.length) : 0;
          setProjectDetails({ ...details, progress: projectProgress });

          const tasksForGanttResponse = await fetchProjectTasks(projectId);
          console.log('Fetched Tasks for Gantt:', tasksForGanttResponse);
          setProjectTasksForGantt(tasksForGanttResponse.tasks || []);
          
          if (details.leader_id) {
            const leaderData = await fetchLeader(details.leader_id);
            setLeader(leaderData);
          }
        }
      }
    } catch (error) {
      console.error('Initialization Error:', error);
      navigate('/');
    }
  };

  useEffect(() => {
    initializeData();
  }, [activeTab]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  const behindScheduleTasks = projectTasksForPie.filter(task => task.status === 'BEHIND_SCHEDULE').length;
  const inProgressTasks = projectTasksForPie.filter(task => task.status === 'IN_PROGRESS').length;
  const completedTasks = projectTasksForPie.filter(task => task.status === 'COMPLETED').length;
  const totalTasks = projectTasksForPie.length;

  const pieData = [
    { name: 'Behind Schedule', value: totalTasks ? (behindScheduleTasks / totalTasks) * 100 : 0 },
    { name: 'In Progress', value: totalTasks ? (inProgressTasks / totalTasks) * 100 : 0 },
    { name: 'Completed', value: totalTasks ? (completedTasks / totalTasks) * 100 : 0 },
  ];

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
    ...projectTasksForGantt.map(task => [
      task.id.toString(),
      task.task_name,
      new Date(task.start_date),
      new Date(task.end_date),
      null,
      task.progress,
      null,
    ]),
  ];

  if (!user) return <div className="flex justify-center items-center min-h-screen bg-[#f0f6ff]">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-[#f0f6ff]">
      <Sidebar isOpen={isSidebarOpen} />
      <div className="flex-1 flex flex-col">
        <Header
          user={user}
          onLogout={handleLogout}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div className={`flex-1 pl-4 pr-4 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <div className="pt-24">
            <div className="flex justify-between items-center mb-4">
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
                    onClick={async () => {
                      setActiveTab(index);
                      const details = await fetchProjectDetails(project.id);
                      const tasksForPieResponse = await fetchPTAssignments(project.id);
                      const taskAssignments = tasksForPieResponse.task_assignments || [];
                      setProjectTasksForPie(taskAssignments);
                      const totalProgress = taskAssignments.reduce((sum, task) => sum + (task.progress || 0), 0);
                      const projectProgress = taskAssignments.length > 0 ? Math.round(totalProgress / taskAssignments.length) : 0;
                      setProjectDetails({ ...details, progress: projectProgress });
                      const tasksForGanttResponse = await fetchProjectTasks(project.id);
                      setProjectTasksForGantt(tasksForGanttResponse.tasks || []);
                    }}
                  >
                    {project.project_name}
                  </button>
                ))}
              </div>
              <button
                className="px-4 py-1 rounded-lg text-sm font-medium bg-green-500 text-white hover:bg-green-600 transition-all duration-300 hover:shadow-md"
                style={{ marginLeft: '20px' }}
                onClick={() => navigate('/create-project')}
              >
                <span className="mr-1">+</span> NEW PROJECT
              </button>
            </div>
            {projectDetails && projectDetails.project_name && (
              <div className="flex h-full">
                <div className="w-1/2 pr-4 bg-white shadow p-4">
                  <h2 className="text-2xl font-bold mb-4">Project Name: {projectDetails.project_name}</h2>
                  {leader && <p className="mb-4"><strong>Leader:</strong> {leader.displayName || 'Unknown Leader'}</p>}
                  <p className="mb-4"><strong>Start Date:</strong> {new Date(projectDetails.start_date).toLocaleDateString()}</p>
                  <p><strong>End Date:</strong> {new Date(projectDetails.end_date).toLocaleDateString()}</p>
                  <div className="mt-4">
                    <p><strong>Progress:</strong></p>
                    <div className="relative w-24 h-24 mx-16">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle
                          className="text-gray-200"
                          strokeWidth="10"
                          stroke="currentColor"
                          fill="transparent"
                          r="45"
                          cx="50"
                          cy="50"
                        />
                        <circle
                          className="text-blue-500"
                          strokeWidth="10"
                          stroke="currentColor"
                          fill="transparent"
                          r="45"
                          cx="50"
                          cy="50"
                          strokeDasharray="283"
                          strokeDashoffset={(1 - (projectDetails.progress || 0) / 100) * 283}
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold">{projectDetails.progress || 0}%</span>
                      </div>
                    </div>
                    <button
                      className="mt-4 px-3 py-1 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-all duration-300"
                      onClick={() => {
                        const projectId = projects[activeTab]?.id;
                        navigate(`/project-details/${projectId}`);
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
                <div className="w-1/2 pl-4 bg-white shadow p-4">
                  <div className="flex justify-end mb-4">
                    <select
                      value={chartType}
                      onChange={(e) => setChartType(e.target.value)}
                      className="p-2 border rounded"
                    >
                      <option value="Pie Chart">Pie Chart</option>
                      <option value="Gantt Chart">Gantt Chart</option>
                    </select>
                  </div>
                  {chartType === 'Pie Chart' && (
                    <PieChart width={500} height={300}>
                      <Pie
                        data={pieData}
                        cx={180}
                        cy={130}
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#D32F2F" />
                        <Cell fill="#FFC107" />
                        <Cell fill="#388E3C" />
                      </Pie>
                      <Tooltip />
                      <Legend
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        wrapperStyle={{
                          padding: '0 20px',
                          lineHeight: '24px',
                          fontSize: '14px',
                          maxHeight: '200px',
                          overflowY: 'auto',
                        }}
                      />
                    </PieChart>
                  )}
                  {chartType === 'Gantt Chart' && (
                    <Chart
                      width={'100%'}
                      height={'400px'}
                      chartType="Gantt"
                      loader={<div>Loading Chart</div>}
                      data={ganttData}
                      options={{
                        height: 400,
                        gantt: {
                          trackHeight: 30,
                        },
                      }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;