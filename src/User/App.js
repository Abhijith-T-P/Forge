// src/App.js

import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./Pages/Dashboard/Dashboard";
import Sidebar from "./Components/Sidebar/Sidebar";
import Header from "./Components/Header/Header";
import "./Style.css";
import AddItem from "./Pages/AddItem/AddItem";
import StockList from "./Pages/StockList/StockList";
import StockDetail from "./Pages/ItemDetail/StockDetail";


const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
            <Route path="/AddItem" element={<AddItem />} />
            <Route path="/StockList" element={<StockList />} />
            <Route path="/Item/:itemCode" element={<StockDetail />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default App;
