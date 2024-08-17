import React, { useState, useEffect, useCallback } from 'react';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import './Analytics.css';

ChartJS.register(...registerables);

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    totalInventory: 0,
    soldItems: 0,
    topSellingItems: [],
    inventoryByStage: { Cutting: 0, Finished: 0, Tapping: 0 },
    inventoryByColor: {},
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const getDateRange = useCallback((range) => {
    const now = new Date();
    switch (range) {
      case 'today':
        return [new Date(now.setHours(0, 0, 0, 0)), new Date()];
      case 'week':
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        return [startOfWeek, new Date()];
      case 'month':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return [startOfMonth, new Date()];
      case 'year':
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        return [startOfYear, new Date()];
      case 'custom':
        return [new Date(customStartDate), new Date(customEndDate)];
      default:
        return [new Date(0), new Date()];
    }
  }, [customStartDate, customEndDate]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [startDate, endDate] = getDateRange(timeRange);
  
      const collections = ['Cutting', 'Finished', 'Tapping', 'Sold'];
      const data = {
        totalInventory: 0,
        soldItems: 0,
        topSellingItems: [],
        inventoryByStage: { Cutting: 0, Finished: 0, Tapping: 0 },
        inventoryByColor: {},
      };
  
      for (const collectionName of collections) {
        const colRef = collection(db, collectionName);
        const q = timeRange === 'all'
          ? query(colRef) // Fetch all documents without date filtering
          : query(colRef, where('date', '>=', startDate), where('date', '<=', endDate));
          
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach(doc => {
          const docData = doc.data();
          if (collectionName === 'Sold') {
            Object.values(docData.soldQuantities || {}).forEach(quantity => {
              data.soldItems += parseFloat(quantity) || 0;
            });
          } else {
            const quantityField = collectionName === 'Cutting' ? 'stockByColor' :
                                  collectionName === 'Finished' ? 'finishedQuantities' : 'tapedQuantities';
            let collectionTotal = 0;
            Object.entries(docData[quantityField] || {}).forEach(([color, quantity]) => {
              const qty = parseFloat(quantity) || 0;
              collectionTotal += qty;
              data.inventoryByColor[color] = (data.inventoryByColor[color] || 0) + qty;
            });
            data.inventoryByStage[collectionName] += collectionTotal;
            data.totalInventory += collectionTotal;
          }
        });
      }
  
      // Calculate top selling items
      const soldSnapshot = await getDocs(timeRange === 'all'
        ? query(collection(db, 'Sold'))
        : query(collection(db, 'Sold'), where('date', '>=', startDate), where('date', '<=', endDate)));
        
      const soldItems = [];
      soldSnapshot.forEach(doc => {
        const docData = doc.data();
        const totalSold = Object.values(docData.soldQuantities || {}).reduce((a, b) => (parseFloat(a) || 0) + (parseFloat(b) || 0), 0);
        soldItems.push({ itemCode: docData.itemCode, totalSold });
      });
      data.topSellingItems = soldItems.sort((a, b) => b.totalSold - a.totalSold).slice(0, 5);
  
      setAnalyticsData(data);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  }, [timeRange, getDateRange]);
  

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleModalSubmit = () => {
    setTimeRange('custom');
    setModalOpen(false);
  };

  const getButtonClass = (range) => {
    return timeRange === range ? 'active' : '';
  };

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  const inventoryByStageData = {
    labels: Object.keys(analyticsData.inventoryByStage),
    datasets: [{
      data: Object.values(analyticsData.inventoryByStage),
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
    }]
  };

  const inventoryByColorData = {
    labels: Object.keys(analyticsData.inventoryByColor),
    datasets: [{
      data: Object.values(analyticsData.inventoryByColor),
      backgroundColor: Object.keys(analyticsData.inventoryByColor).map(color => color),
    }]
  };

  const topSellingItemsData = {
    labels: analyticsData.topSellingItems.map(item => item.itemCode),
    datasets: [{
      label: 'Total Sold',
      data: analyticsData.topSellingItems.map(item => item.totalSold),
      backgroundColor: '#36A2EB',
    }]
  };

  return (
    <div className="analytics-container">
      <h1>Analytics Dashboard</h1>
      
      <div className="filter-buttons">
        <button className={getButtonClass('today')} onClick={() => setTimeRange('today')}>Today</button>
        <button className={getButtonClass('week')} onClick={() => setTimeRange('week')}>This Week</button>
        <button className={getButtonClass('month')} onClick={() => setTimeRange('month')}>This Month</button>
        <button className={getButtonClass('year')} onClick={() => setTimeRange('year')}>This Year</button>
        <button className={getButtonClass('custom')} onClick={() => setModalOpen(true)}>Custom Range</button>
        <button className={getButtonClass('all')} onClick={() => setTimeRange('all')}>All Time</button>
      </div>

      <div className="summary-stats">
        <div className="stat-box">
          <h3>Total Inventory</h3>
          <p>{analyticsData.totalInventory.toLocaleString()}</p>
        </div>
        <div className="stat-box">
          <h3>Total Sold Items</h3>
          <p>{analyticsData.soldItems.toLocaleString()}</p>
        </div>
      </div>

      <div className="chart-container">
        <div className="chart">
          <h3>Inventory by Stage</h3>
          <Pie data={inventoryByStageData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
        <div className="chart">
          <h3>Inventory by Color</h3>
          <Pie data={inventoryByColorData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>

      <div className="chart-container">
        <div className="chart">
          <h3>Top 5 Selling Items</h3>
          <Bar data={topSellingItemsData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Select Custom Date Range</h2>
            <label>
              Start Date:
              <input 
                type="date" 
                value={customStartDate} 
                onChange={(e) => setCustomStartDate(e.target.value)} 
              />
            </label>
            <label>
              End Date:
              <input 
                type="date" 
                value={customEndDate} 
                onChange={(e) => setCustomEndDate(e.target.value)} 
              />
            </label>
            <button onClick={handleModalSubmit}>Apply</button>
            <button onClick={() => setModalOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;