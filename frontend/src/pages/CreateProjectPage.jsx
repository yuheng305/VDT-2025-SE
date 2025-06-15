import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUserData } from '../api';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import CreateProjectForm from '../components/CreateProjectForm';

const CreateProjectPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const userData = await fetchUserData();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        navigate('/');
      }
    };
    initializeData();
  }, [navigate]);

  const handleFormSubmit = (formData) => {
    console.log('New Project Data:', formData);
    // Thêm logic gọi API để tạo dự án mới ở đây
    navigate('/dashboard'); // Quay lại dashboard sau khi tạo
  };

  const handleCancel = () => {
    navigate('/dashboard'); // Quay lại dashboard khi hủy
  };

  if (!user) return <div className="flex justify-center items-center min-h-screen bg-[#f0f6ff]">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-[#f0f6ff]">
      <Sidebar isOpen={isSidebarOpen} />
      <div className={`flex-1 flex flex-col`}>
        <Header
          user={user}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div className="flex-1 p-4 pt-24">
          <CreateProjectForm onSubmit={handleFormSubmit} onCancel={handleCancel} />
        </div>
      </div>
    </div>
  );
};

export default CreateProjectPage;