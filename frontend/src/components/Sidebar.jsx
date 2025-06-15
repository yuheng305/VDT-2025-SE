import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AiOutlineDashboard, AiOutlineProject, AiOutlineBell } from 'react-icons/ai';
import { fetchUserData, fetchProjects } from '../api'; 



const Sidebar = ({ isOpen }) => {

  const [user, setUser] = React.useState(null);
  const [projects, setProjects] = React.useState([]);
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
          const projectId = fetchedProjects[0].id;
        }
      }
    } catch (error) {
      console.error('Error initializing data:', error);
    }
    };
  const location = useLocation(); // Lấy thông tin route hiện tại

  return (
    <aside
      className={`bg-white shadow-lg w-64 px-4 fixed h-screen transition-all duration-300 ${
        isOpen ? 'left-0' : '-left-64'
      } top-16 z-30 border-r border-red-500`}
    >
      <ul className="mt-6 space-y-2">
        <li className={`hover:bg-red-100 rounded-lg cursor-pointer ${location.pathname === '/dashboard' ? 'bg-red-100' : ''}`}>
          <Link to="/dashboard" className="text-gray-600 p-2 w-full flex items-center text-lg hover:text-red-800">
            <AiOutlineDashboard className="mr-3" /> Dashboard
          </Link>
        </li>
        <li className={`hover:bg-red-100 rounded-lg cursor-pointer ${location.pathname === '/project-details' || location.pathname.startsWith('/project-details/') ? 'bg-red-100' : ''}`}>
          <Link to={`/project-details/{projectId`} className="text-gray-600 p-2 w-full flex items-center text-lg hover:text-red-800">
            <AiOutlineProject className="mr-3" /> Project Details
          </Link>
        </li>
        <li className={`hover:bg-red-100 rounded-lg cursor-pointer ${location.pathname === '/notifications' ? 'bg-red-100' : ''}`}>
          <Link to="/notifications" className="text-gray-600 p-2 w-full flex items-center text-lg hover:text-red-800">
            <AiOutlineBell className="mr-3" /> Notification Settings
          </Link>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;