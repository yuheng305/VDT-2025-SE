import React, { useState } from 'react';
import { fetchPTAssignments, importTasks } from '../api';

const FileUpload = ({ projectId, onTaskUpdate }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === 'application/vnd.ms-excel' || file.type === 'text/csv' || file.name.endsWith('.csv') || file.name.endsWith('.xlsx'))) {
      setSelectedFile(file);
      setMessage('');
    } else {
      setSelectedFile(null);
      setMessage('Lỗi định dạng file. Vui lòng chọn file Excel/CSV.');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('Vui lòng chọn file trước khi tải lên.');
      return;
    }

    try {
      await importTasks(projectId, selectedFile);
      setMessage('File đã import thành công.');
      // Fetch lại dữ liệu task assignments và truyền lên parent
      const tasksResponse = await fetchPTAssignments(projectId);
      onTaskUpdate(tasksResponse.task_assignments || []);
    } catch (error) {
      console.error('Lỗi khi upload file:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setMessage(`Lỗi khi import file: ${error.response.data.message}`);
      } else {
        setMessage('Lỗi định dạng file hoặc kết nối mạng.');
      }
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-gray-700 font-semibold mb-2">Import File</label>
      <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg text-center">
        <p>Select file or drag Excel/CSV file here</p>
        <input
          type="file"
          accept=".csv, .xlsx, application/vnd.ms-excel"
          className="mt-2 ml-20"
          onChange={handleFileChange}
        />
        {selectedFile && (
          <button
            onClick={handleUpload}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Tải file lên
          </button>
        )}
        {message && <p className={`mt-2 ${message.includes('thành công') ? 'text-green-500' : 'text-red-500'}`}>{message}</p>}
      </div>
    </div>
  );
};

export default FileUpload;