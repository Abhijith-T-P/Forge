import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./Pages/Dashboard/Dashboard";
import Sidebar from "./Components/Sidebar/Sidebar";
import Header from "./Components/Header/Header";
import "./Style.css";
import Add from "./Pages/Add/app";
import Stock from "./Pages/Stock/app";
import AddColor from "./Pages/AddColor/AddColor";
import AddCode from "./Pages/AddCode/AddCode";
import AddAdmin from "./Pages/AddAdmin/AddAdmin";
import AddSalesMan from "./Pages/AddSalesMan/AddSalesMan";

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Function to toggle the sidebar state
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="app-container">
      <Header onToggleSidebar={toggleSidebar} />
      <div className="content">
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className={`main-content ${isSidebarOpen ? "sidebar-open" : ""}`}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/Add/*" element={<Add />} />
            <Route path="/Stock/*" element={<Stock />} />
            <Route path="/AddColor" element={<AddColor />} />
            <Route path="/AddCode" element={<AddCode />} />
            <Route path="/AddAdmin" element={<AddAdmin />} />
            <Route path="/AddSalesMan" element={<AddSalesMan />} />
            
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default App;
