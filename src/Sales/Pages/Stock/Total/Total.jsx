import React, { useState, useEffect, useMemo } from 'react';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../../../config/firebase';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './Total.css'; // Ensure this file exists and is correctly named

const Total = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsData, setItemsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [availableColors, setAvailableColors] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const collections = ['Cutting', 'Finished', 'Tapping'];
        const data = {};

        // Fetch available colors
        const colorsSnapshot = await getDocs(collection(db, 'colors'));
        const colors = [];
        colorsSnapshot.forEach(doc => {
          colors.push(doc.data().color);
        });
        setAvailableColors(colors);

        // Fetch and aggregate data
        for (const collectionName of collections) {
          const querySnapshot = await getDocs(collection(db, collectionName));
          querySnapshot.forEach(doc => {
            const docData = doc.data();
            if (docData.itemCode) {
              if (!data[docData.itemCode]) {
                data[docData.itemCode] = {};
                colors.forEach(color => data[docData.itemCode][color] = 0);
              }
              
              let quantityField;
              if (collectionName === 'Cutting') {
                quantityField = 'stockByColor';
              } else if (collectionName === 'Finished') {
                quantityField = 'finishedQuantities';
              } else if (collectionName === 'Tapping') {
                quantityField = 'tapedQuantities';
              }

              if (docData[quantityField]) {
                Object.entries(docData[quantityField]).forEach(([color, quantity]) => {
                  if (colors.includes(color)) {
                    data[docData.itemCode][color] += parseInt(quantity, 10);
                  }
                });
              }
            }
          });
        }
        
        setItemsData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredItems = useMemo(() => {
    return Object.entries(itemsData).filter(([itemCode]) =>
      itemCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, itemsData]);

  const getCellClass = (value) => {
    if (value === 0) return "quantity-zero";
    if (value > 0 && value < 20) return "quantity-low";
    if (value >= 20 && value < 50) return "quantity-medium";
    return "quantity-high";
  };

  const handleExportPDF = () => {
    const input = document.getElementById('table-to-export');
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, heightLeft - imgHeight, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save('Total_table.pdf');
    });
  };

  return (
    <div className="total-list">
      <input
        type="text"
        placeholder="Search by item code..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />
      <button onClick={handleExportPDF} className="export-button">
        Export as PDF
      </button>
      <table id="table-to-export" className="excel-table">
        <thead>
          <tr>
            <th>ITEM</th>
            {availableColors.map(color => (
              <th key={color}>{color}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={availableColors.length + 1} className="loading">Loading...</td>
            </tr>
          ) : (
            filteredItems.length > 0 ? (
              filteredItems.map(([itemCode, data]) => (
                <tr key={itemCode}>
                  <td className="item-code">{itemCode}</td>
                  {availableColors.map(color => {
                    const total = data[color] || 0;
                    return (
                      <td key={`${itemCode}-${color}`} className={`quantity ${getCellClass(total)}`}>
                        {total}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={availableColors.length + 1} className="no-item-found">
                  No items found
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Total;
