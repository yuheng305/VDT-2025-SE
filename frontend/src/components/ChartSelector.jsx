import React from 'react';

const ChartSelector = ({ chartType, setChartType }) => {
  return (
    <select 
      value={chartType} 
      onChange={(e) => setChartType(e.target.value)}
      className="p-2 border rounded"
    >
      <option value="Pie Chart">Pie Chart</option>
      <option value="Gantt Chart">Gantt Chart</option>
    </select>
  );
};

export default ChartSelector;