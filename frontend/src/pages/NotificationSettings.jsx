import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUserData, fetchProjects, fetchLateTasks, saveNotificationConfig, deleteNotificationConfig, logout } from '../api';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const NotificationSettings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [lateTasks, setLateTasks] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    projectName: '',
    projectLeaderEmail: '',
    frequency: 'daily',
    sendAlertForDelayedTasks: false,
  });

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userData = await fetchUserData();
        setUser(userData);

        const fetchedProjects = await fetchProjects(userData.id);
        setProjects(fetchedProjects);

        if (fetchedProjects.length > 0) {
          const project = fetchedProjects[activeTab];
          setFormData({
            projectName: project.project_name,
            projectLeaderEmail: project.leader?.email || '',
            frequency: 'daily',
            sendAlertForDelayedTasks: false,
          });

          console.log('Fetching late tasks for project:', project.id);
          const tasks = await fetchLateTasks(project.id);
          console.log('Late tasks fetched:', tasks);
          setLateTasks(tasks);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab, navigate]);

  const handleTabChange = (index) => {
    setActiveTab(index);
    const project = projects[index];
    setFormData({
      projectName: project.project_name,
      projectLeaderEmail: project.leader?.email || '',
      frequency: formData.frequency,
      sendAlertForDelayedTasks: formData.sendAlertForDelayedTasks,
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCreate = async () => {
    try {
      const project = projects[activeTab];
      if (!project) throw new Error('No project selected');

      await saveNotificationConfig({
        projectId: project.id,
        email: formData.projectLeaderEmail,
        frequency: formData.frequency,
        sendAlert: formData.sendAlertForDelayedTasks,
      });
      alert('Notification settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert(`Failed to save settings. Please try again! Error: ${error.message}`);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this configuration?')) {
      try {
        const project = projects[activeTab];
        await deleteNotificationConfig(project.id);
        setFormData({
          projectName: project.project_name,
          projectLeaderEmail: project.leader?.email || '',
          frequency: 'daily',
          sendAlertForDelayedTasks: false,
        });
        alert('Configuration deleted successfully!');
      } catch (error) {
        console.error('Error deleting configuration:', error);
        alert('Failed to delete configuration. Please try again!');
      }
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen bg-[#f0f6ff]">Loading...</div>;
  if (!user || projects.length === 0) return <div className="flex justify-center items-center min-h-screen bg-[#f0f6ff]">No projects found.</div>;

  return (
    <div className="flex min-h-screen bg-[#f0f6ff]">
      <Sidebar isOpen={isSidebarOpen} />
      <div className={`flex-1 flex flex-col`}>
        <Header user={user} onLogout={handleLogout} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
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

          <div className="bg-white rounded-lg shadow-md p-6 flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/2">
              <h2 className="text-2xl font-bold mb-4">Notification Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Project Name</label>
                  <input
                    type="text"
                    value={formData.projectName}
                    readOnly
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Project Leader Email</label>
                  <input
                    type="email"
                    name="projectLeaderEmail"
                    value={formData.projectLeaderEmail}
                    onChange={handleChange}
                    placeholder="Enter leader email"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Frequency</label>
                  <select
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="sendAlertForDelayedTasks"
                    checked={formData.sendAlertForDelayedTasks}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Send alert for delayed tasks</label>
                </div>
              </div>
            </div>

            <div className="w-full md:w-1/2 bg-gray-100 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Email Preview</h3>
              <div className="bg-white p-4 rounded shadow">
                <p className="font-bold mb-2">Subject: Task Delay Notification for {formData.projectName}</p>
                <p>Dear Project Leader,</p>
                <p className="mt-2">
                  We would like to inform you that a task in your project "{formData.projectName}" is delayed.
                </p>
                <div className="mt-2">
                  <p><strong>Task Details:</strong></p>
                  {lateTasks.length > 0 ? (
                    <ul className="list-disc ml-5">
                      {lateTasks.map((task) => (
                        <li key={`${task.taskId}-${task.endDate}`}>
                          <p>Task Name: {task.taskName}</p>
                          <p>Assignee: {task.employeeName}</p>
                          <p>Due Date: {new Date(task.endDate).toLocaleDateString('en-US')}</p>
                          <p>Progress: {task.progress}%</p>
                          <p>Status: {task.status}</p>
                          <p>Estimated Time: {task.estimateTime} hours</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No delayed tasks.</p>
                  )}
                </div>
                <p className="mt-2">
                  Please review the task and take necessary actions to get it back on track.
                </p>
                <p className="mt-4">Best regards,</p>
                <p>Your Project Management Team</p>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                This email will be sent {formData.frequency} if "Send alert for delayed tasks" is enabled.
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={!formData.projectLeaderEmail}
            >
              Save
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;