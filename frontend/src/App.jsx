import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import CreateProjectPage from "./pages/CreateProjectPage";
import ProjectDetails from "./pages/ProjectDetails";
import NotificationSettings from "./pages/NotificationSettings";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-project" element={<CreateProjectPage />} />
        <Route path="/project-details/:id" element={<ProjectDetails />} /> {/* Updated dynamic route */}
        <Route path="/notifications" element={<NotificationSettings />} />
      </Routes>
    </Router>
  );
}

export default App;