import React, { useState } from 'react';
import Modal from 'react-modal';
import { fetchPTAssignments, updateTaskAssignment, deleteTaskAssignment } from '../api';

Modal.setAppElement('#root'); // Cần thiết để tránh lỗi accessibility

const TaskAssignmentTable = ({ taskAssignments, projectId }) => {
  const [editTask, setEditTask] = useState(null);
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    estimate_time: '',
    progress: '',
    status: '',
  });
  const [message, setMessage] = useState('');

  const handleEdit = (taskId) => {
    const taskToEdit = taskAssignments.find((task) => task.id === taskId);
    setEditTask(taskToEdit);
    setFormData({
      start_date: taskToEdit.start_date,
      end_date: taskToEdit.due_date,
      estimate_time: taskToEdit.estimate_time,
      progress: taskToEdit.progress,
      status: taskToEdit.status,
    });
    setMessage('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      // Validate dữ liệu
      if (formData.progress < 0 || formData.progress > 100) {
        setMessage('Tiến độ phải từ 0 đến 100.');
        return;
      }
      if (!['PENDING', 'IN_PROGRESS', 'COMPLETED', 'BEHIND_SCHEDULE'].includes(formData.status)) {
        setMessage('Status must be BEHIND_SCHEDULE, IN_PROGRESS or COMPLETED.');
        return;
      }

      // Chuyển đổi progress từ chuỗi sang số và định dạng ngày giờ
      const updatedData = {
        ...formData,
        progress: parseFloat(formData.progress), // Chuyển đổi sang Float
        start_date: `${formData.start_date}`, // Định dạng ISO hợp lệ
        end_date: `${formData.end_date}`, // Định dạng ISO hợp lệ
      };

      await updateTaskAssignment(editTask.id, updatedData);
      setMessage('Cập nhật task thành công!');
      // Cập nhật lại danh sách
      const response = await fetchPTAssignments(projectId);
      window.location.reload(); // Có thể thay bằng state management
      setEditTask(null);
    } catch (error) {
      console.error('Lỗi khi cập nhật task:', error);
      setMessage('Lỗi khi cập nhật task. Vui lòng thử lại.');
    }
  };

  const handleDelete = async (taskId) => {
    if (window.confirm(`Do you want to delete this task?`)) {
      try {
        await deleteTaskAssignment(taskId);
        const response = await fetchPTAssignments(projectId);
        window.location.reload(); // Có thể thay bằng state management
      } catch (error) {
        console.error('Lỗi khi xóa task:', error);
      }
    }
  };

  const closeModal = () => {
    setEditTask(null);
    setMessage('');
  };

  return (
    <>
      <table className="min-w-full bg-white border border-gray-300 mt-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b text-left">Task Name</th>
            <th className="py-2 px-4 border-b text-left">Employee Email</th>
            <th className="py-2 px-4 border-b text-left">Start Date</th>
            <th className="py-2 px-4 border-b text-left">End Date</th>
            <th className="py-2 px-4 border-b text-left">Estimated Time</th>
            <th className="py-2 px-4 border-b text-left">Progress</th>
            <th className="py-2 px-4 border-b text-left">Status</th>
            <th className="py-2 px-4 border-b text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {taskAssignments.map((task) => (
            <tr key={task.id} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{task.task_name}</td>
              <td className="py-2 px-4 border-b">{task.employee_email}</td>
              <td className="py-2 px-4 border-b">{new Date(task.start_date).toLocaleDateString('vi-VN')}</td>
              <td className="py-2 px-4 border-b">{new Date(task.due_date).toLocaleDateString('vi-VN')}</td>
              <td className="py-2 px-4 border-b">{task.estimate_time} giờ</td>
              <td className="py-2 px-4 border-b">{task.progress}%</td>
              <td className="py-2 px-4 border-b">
                <span className={`px-2 py-1 rounded ${task.status === 'BEHIND_SCHEDULE' ? 'bg-red-400' : task.status === 'IN_PROGRESS' ? 'bg-yellow-200' : 'bg-green-200'}`}>
                  {task.status}
                </span>
              </td>
              <td className="py-2 px-4 border-b">
                <button
                  onClick={() => handleEdit(task.id)}
                  className="text-blue-500 hover:underline mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        isOpen={!!editTask}
        onRequestClose={closeModal}
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: '500px',
            padding: '20px',
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
        }}
        contentLabel="Edit Task Modal"
      >
        <h3 className="text-xl font-bold mb-4">Edit Task</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date.split('T')[0]}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date.split('T')[0]}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Estimated Time (Hour)</label>
            <input
              type="number"
              name="estimate_time"
              value={formData.estimate_time}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Progress (%)</label>
            <input
              type="number"
              name="progress"
              value={formData.progress}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            >
              <option value="PENDING">PENDING</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="BEHIND_SCHEDULE">BEHIND_SCHEDULE</option>
            </select>
          </div>
        </div>
        {message && <p className={`mt-2 ${message.includes('thành công') ? 'text-green-500' : 'text-red-500'}`}>{message}</p>}
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={closeModal}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </Modal>
    </>
  );
};

export default TaskAssignmentTable;