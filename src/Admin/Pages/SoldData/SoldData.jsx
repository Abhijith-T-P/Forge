import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import './SoldData.css';
import { Link } from 'react-router-dom';

const SoldData = () => {
  const [soldItems, setSoldItems] = useState({});
  const [availableColors, setAvailableColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const fetchSoldData = async () => {
      try {
        const soldSnapshot = await getDocs(collection(db, 'Sold'));
        const soldData = {};
        const colors = new Set();

        soldSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.itemCode && data.soldQuantities) {
            soldData[data.itemCode] = data.soldQuantities;
            Object.keys(data.soldQuantities).forEach(color => colors.add(color));
          }
        });

        setSoldItems(soldData);
        setAvailableColors(Array.from(colors));
        setLoading(false);
      } catch (err) {
        console.error("Error fetching sold data:", err);
        setError("Failed to load sold data. Please try again later.");
        setLoading(false);
      }
    };

    fetchSoldData();
  }, []);

  const filteredItems = useMemo(() => {
    return Object.entries(soldItems).filter(([itemCode]) =>
      itemCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, soldItems]);

  const getCellClass = (quantity) => {
    if (quantity === 0) return 'zero';
    if (quantity < 10) return 'low';
    return '';
  };

  const handleQuantityChange = (itemCode, color, event) => {
    const newValue = parseInt(event.target.value, 10);
    if (newValue > 0) {
      setSoldItems(prevItems => ({
        ...prevItems,
        [itemCode]: {
          ...prevItems[itemCode],
          [color]: newValue
        }
      }));
    }
  };

  const saveChanges = async () => {
    try {
      for (const [itemCode, data] of Object.entries(soldItems)) {
        const itemRef = doc(db, 'Sold', itemCode);
        await updateDoc(itemRef, { soldQuantities: data });
      }
      setEditing(false);
    } catch (err) {
      console.error("Error updating sold data:", err);
      setError("Failed to update sold data. Please try again later.");
    }
  };

  const exportToPDF = async () => {
    const input = document.getElementById('sold-data-table');
    if (input) {
      const canvas = await html2canvas(input, { scrollX: 0, scrollY: -window.scrollY });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pageHeight = 295; // A4 height in mm
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('sold_data_summary.pdf');
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredItems.map(([itemCode, data]) => ({
        Item: itemCode,
        ...availableColors.reduce((acc, color) => {
          acc[color] = data[color] || 0;
          return acc;
        }, {}),
      }))
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sold Data');

    XLSX.writeFile(wb, 'sold_data_summary.xlsx');
  };

  if (error) {
    return <div className="sold-data-container error">{error}</div>;
  }

  return (
    <div className="sold-data-container">
      <h1>Sold Items Summary</h1>
      <input
        type="text"
        placeholder="Search by item code..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />
      <div className="export-buttons">
        <button onClick={exportToPDF} className="export-pdf-button">Export as PDF</button>
        <button onClick={exportToExcel} className="export-excel-button">Export as Excel</button>
        {editing ? (
          <button onClick={saveChanges} className="save-changes-button">Save Changes</button>
        ) : (
          <button onClick={() => setEditing(true)} className="edit-button">Edit</button>
        )}
      </div>
      <div className="sold-data-link-container">
        <Link to="../Sold" className="sold-data-button">Back</Link>
      </div>
      <table id="sold-data-table" className="excel-table">
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
                  {availableColors.map((color) => {
                    const quantity = data[color] || 0;
                    return (
                      <td key={`${itemCode}-${color}`} className={`quantity ${getCellClass(quantity)}`}>
                        {editing ? (
                          <input
                            type="number"
                            value={quantity}
                            min="1"
                            onChange={(e) => handleQuantityChange(itemCode, color, e)}
                            className="quantity-input"
                          />
                        ) : (
                          quantity
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={availableColors.length + 1} className="no-item-found">No items found</td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SoldData;
