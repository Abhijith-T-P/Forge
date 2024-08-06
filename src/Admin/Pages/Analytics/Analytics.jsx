import React, { useState, useEffect } from 'react';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import './Analytics.css'
ChartJS.register(...registerables);

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    totalInventory: 0,
    soldItems: 0,
    topSellingItems: [],
    inventoryByStage: {},
    inventoryByColor: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const collections = ['Cutting', 'Finished', 'Tapping', 'Sold'];
        const data = {
          totalInventory: 0,
          soldItems: 0,
          topSellingItems: [],
          inventoryByStage: { Cutting: 0, Finished: 0, Tapping: 0 },
          inventoryByColor: {},
        };

        for (const collectionName of collections) {
          const querySnapshot = await getDocs(collection(db, collectionName));
          querySnapshot.forEach(doc => {
            const docData = doc.data();
            if (collectionName === 'Sold') {
              Object.values(docData.soldQuantities || {}).forEach(quantity => {
                data.soldItems += quantity;
              });
            } else {
              const quantityField = collectionName === 'Cutting' ? 'stockByColor' :
                                    collectionName === 'Finished' ? 'finishedQuantities' : 'tapedQuantities';
              Object.values(docData[quantityField] || {}).forEach(quantity => {
                data.totalInventory += quantity;
                data.inventoryByStage[collectionName] += quantity;
                Object.entries(docData[quantityField] || {}).forEach(([color, qty]) => {
                  data.inventoryByColor[color] = (data.inventoryByColor[color] || 0) + qty;
                });
              });
            }
          });
        }

        // Calculate top selling items
        const soldSnapshot = await getDocs(collection(db, 'Sold'));
        const soldItems = [];
        soldSnapshot.forEach(doc => {
          const docData = doc.data();
          const totalSold = Object.values(docData.soldQuantities || {}).reduce((a, b) => a + b, 0);
          soldItems.push({ itemCode: docData.itemCode, totalSold });
        });
        data.topSellingItems = soldItems.sort((a, b) => b.totalSold - a.totalSold).slice(0, 5);

        setAnalyticsData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
      backgroundColor: Object.keys(analyticsData.inventoryByColor),
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
      
      <div className="summary-stats">
        <div className="stat-box">
          <h3>Total Inventory</h3>
          <p>{analyticsData.totalInventory}</p>
        </div>
        <div className="stat-box">
          <h3>Total Sold Items</h3>
          <p>{analyticsData.soldItems}</p>
        </div>
      </div>

      <div className="chart-container">
        <div className="chart">
          <h3>Inventory by Stage</h3>
          <Pie data={inventoryByStageData} />
        </div>
        <div className="chart">
          <h3>Inventory by Color</h3>
          <Pie data={inventoryByColorData} />
        </div>
      </div>

      <div className="chart-container">
        <div className="chart">
          <h3>Top 5 Selling Items</h3>
          <Bar data={topSellingItemsData} />
        </div>
      </div>
    </div>
  );
};

export default Analytics;