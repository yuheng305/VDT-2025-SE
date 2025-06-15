import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001',
  withCredentials: true,
});

export const fetchUserData = async () => {
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      return userData;
    } else {
      const response = await api.get('/api/auth/me');
      if (response.data.message === 'Unauthorized' || response.data.message === 'Invalid token') {
        throw new Error('Unauthorized');
      }
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const fetchProjects = async (userId) => {
  try {
    const response = await api.get(`/api/employees/${userId}/projects`);
    console.log('Projects Data:', response.data);
    return response.data.projects || [];
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

export const fetchProjectDetails = async (projectId) => {
  try {
    const response = await api.get(`/api/projects/${projectId}`);
    console.log('Project Details:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching project details:', error);
    throw error;
  }
};

export const fetchProjectTasks = async (projectId) => {
  try {
    const response = await api.get(`/api/projects/${projectId}/tasks`);
    console.log('Project Tasks:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching project tasks:', error);
    throw error;
  }
};

export const fetchPTAssignments = async (projectId) => {
  try {
    const response = await api.get(`/api/projects/${projectId}/task-assignments`);
    console.log('Project Task-Assignments:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching project tasks:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await api.get('/api/auth/google/logout');
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const fetchLeader = async (leaderId) => {
  try {
    const response = await api.get(`/api/employees/${leaderId}`);
    console.log('Leader Data:', response.data);
    if (response.status !== 200) {
      throw new Error(`Failed to fetch leader: ${response.statusText}`);
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching leader:', error);
    if (error.response) {
      console.log('Response data:', error.response.data);
      console.log('Response status:', error.response.status);
    }
    throw error;
  }
};

export const importTasks = async (projectId, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`/api/projects/${projectId}/import-tasks`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('Import Tasks Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error importing tasks:', error);
    throw error;
  }
};

export const updateTaskAssignment = async (taskId, data) => {
  try {
    const response = await api.patch(`/api/task-assignment/${taskId}`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('Update Task Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const deleteTaskAssignment = async (taskId) => {
  try {
    const response = await api.delete(`/api/task-assignment/${taskId}`);
    console.log('Delete Task Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

// API mới cho notification settings
export const saveNotificationConfig = async (config) => {
  try {
    const response = await api.post('/api/task-assignment/notification-config', config, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('Save Notification Config Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error saving notification config:', error);
    throw error;
  }
};

export const deleteNotificationConfig = async (projectId) => {
  try {
    const response = await api.delete(`/api/notification-config/${projectId}`);
    console.log('Delete Notification Config Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting notification config:', error);
    throw error;
  }
  
};

export const fetchLateTasks = async (projectId) => {
  try {
    const response = await api.get(`/api/projects/${projectId}/late-tasks`);
    console.log('Late Tasks:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching late tasks:', error);
    throw error;
  }
};

export const createProject = async (data) => {
  console.log('Creating project with data:', data);
  try {
    const response = await api.post(`/api/projects`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('Create Project Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

export const createTask = async (data) => {
  console.log('Creating task with data:', data);
  try {
    const response = await api.post(`/api/tasks`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('Create Task Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};