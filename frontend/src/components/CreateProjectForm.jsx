import React, { useState } from 'react';
import { createProject, createTask } from '../api'; // Sử dụng API từ api.js

const CreateProjectForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    project_name: '',
    leader_email: '',
    start_date: '',
    end_date: '',
    project_description: '',
    tasks: [{ task_name: '' }], // Chỉ cần task_name, start_date và end_date sẽ lấy từ project
  });

  // Xử lý thay đổi giá trị các trường cơ bản
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Xử lý thay đổi giá trị của các task
  const handleTaskChange = (index, e) => {
    const { value } = e.target;
    const newTasks = [...formData.tasks];
    newTasks[index].task_name = value;
    setFormData({ ...formData, tasks: newTasks });
  };

  // Thêm một task mới vào danh sách
  const addTask = () => {
    setFormData({
      ...formData,
      tasks: [...formData.tasks, { task_name: '' }],
    });
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const projectData = {
        project_name: formData.project_name,
        start_date: formData.start_date,
        end_date: formData.end_date,
        leader_email: formData.leader_email,
        project_description: formData.project_description,
      };
      const projectResponse = await createProject(projectData); // Gọi API createProject
      const project_id = projectResponse.project.id; // Lấy project_id từ response

      for (const task of formData.tasks) {
        if (task.task_name) {
          const taskData = {
            task_name: task.task_name,
            project_id,
            start_date: formData.start_date,
            end_date: formData.end_date,
          };
          await createTask(taskData);
        }
      }

      // Thêm thông báo thành công trước khi quay về
      alert('Project and tasks created successfully!');
      onSubmit(); // Gọi callback để quay về Dashboard
    } catch (error) {
      console.error('Lỗi khi tạo project:', error);
      alert('Có lỗi xảy ra khi tạo project. Vui lòng kiểm tra lại thông tin.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Create New Project</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Project Name</label>
          <input
            type="text"
            name="project_name"
            value={formData.project_name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Leader Email</label>
          <input
            type="email"
            name="leader_email"
            value={formData.leader_email}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Start Date</label>
          <input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">End Date</label>
          <input
            type="date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Description</label>
          <textarea
            name="project_description"
            value={formData.project_description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows="4"
          />
        </div>

        {/* Phần nhập task */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Tasks</h3>
          {formData.tasks.map((task, index) => (
            <div key={index} className="mb-2">
              <input
                type="text"
                name="task_name"
                placeholder="Task Name"
                value={task.task_name}
                onChange={(e) => handleTaskChange(index, e)}
                className="w-full p-2 border rounded mb-1"
                required
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addTask}
            className="mt-2 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            Add Task
          </button>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border rounded text-blue-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProjectForm;