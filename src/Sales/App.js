import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./Pages/Dashboard/Dashboard";
import Sidebar from "./Components/Sidebar/Sidebar";
import Header from "./Components/Header/Header";
import "./Style.css";
import StockDetail from "./Pages/ItemDetail/StockDetail";
import Add from "./Pages/Add/app";
import Stock from "./Pages/Stock/app";
import AddColor from "./Pages/AddColor/AddColor";
import AddCode from "./Pages/AddCode/AddCode";

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
            <Route path="/Item/:itemCode" element={<StockDetail />} />
            <Route path="/AddColor" element={<AddColor />} />
            <Route path="/AddCode" element={<AddCode />} />
            
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default App;
