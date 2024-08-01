import React, { useState, useEffect, useMemo } from 'react';
import { getDocs, collection, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import './Dashboard.css';

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsData, setItemsData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const collections = ['Cutting', 'Finished', 'Tapping', 'Hold'];
        const data = {};

        // Fetch available colors
        const colorsSnapshot = await getDocs(collection(db, 'colors'));
        const colors = [];
        colorsSnapshot.forEach(doc => {
          colors.push(doc.data().color);
        });
        console.log("Fetched colors:", colors);

        // Initialize items data
        for (const collectionName of collections) {
          console.log(`Fetching data from ${collectionName} collection`);
          const querySnapshot = await getDocs(collection(db, collectionName));
          querySnapshot.forEach(doc => {
            const docData = doc.data();
            console.log(`Document data for ${collectionName}:`, docData);
            if (docData.itemCode) {
              if (!data[docData.itemCode]) {
                data[docData.itemCode] = {
                  colors: colors,
                  finished: Array(colors.length).fill(0),
                  cuttingQuantities: Array(colors.length).fill(0),
                  tapingQuantities: Array(colors.length).fill(0),
                  hold: Array(colors.length).fill(0),
                };
              }

              let quantityField;
              if (collectionName === 'Cutting') {
                quantityField = 'cuttingQuantities';
              } else if (collectionName === 'Finished') {
                quantityField = 'finished';
              } else if (collectionName === 'Tapping') {
                quantityField = 'tapingQuantities';
              } else if (collectionName === 'Hold') {
                quantityField = 'hold';
              }

              if (docData[quantityField] || docData.hold) {
                const sourceData = collectionName === 'Hold' ? docData.hold : docData[quantityField];
                if (typeof sourceData === 'object') {
                  Object.entries(sourceData).forEach(([color, quantity]) => {
                    if (data[docData.itemCode].colors.includes(color)) {
                      const colorIndex = data[docData.itemCode].colors.indexOf(color);
                      const parsedQuantity = parseInt(quantity, 10);
                      if (!isNaN(parsedQuantity)) {
                        data[docData.itemCode][quantityField][colorIndex] += parsedQuantity;
                      } else {
                        console.warn(`Invalid quantity for ${collectionName}, itemCode: ${docData.itemCode}, color: ${color}`);
                      }
                    }
                  });
                } else {
                  console.warn(`Unexpected data structure for ${collectionName}, itemCode: ${docData.itemCode}`);
                }
              }
            }
          });
        }

        console.log("Final data structure:", data);

        // Remove duplicate item codes
        const uniqueItems = {};
        Object.entries(data).forEach(([itemCode, item]) => {
          if (!uniqueItems[itemCode]) {
            uniqueItems[itemCode] = item;
          }
        });

        setItemsData(uniqueItems);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    console.log("Updated itemsData:", itemsData);
  }, [itemsData]);

  const filteredItems = useMemo(() => {
    return Object.entries(itemsData).filter(([itemCode]) =>
      itemCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, itemsData]);

  const handleHoldChange = (itemCode, index) => async (e) => {
    const newHoldValue = e.target.value;
    if (/^\d*$/.test(newHoldValue)) {
      setItemsData((prevData) => {
        const updatedData = { ...prevData };
        updatedData[itemCode].hold[index] = parseInt(newHoldValue, 10);
        return updatedData;
      });

      // Update Firestore
      try {
        const itemDoc = doc(db, 'Hold', itemCode);
        const color = itemsData[itemCode].colors[index];
        await updateDoc(itemDoc, {
          [`hold.${color}`]: parseInt(newHoldValue, 10)
        });
      } catch (error) {
        console.error("Error updating Firestore:", error);
      }
    }
  };

  const getCellClass = (value) => {
    console.log("getCellClass value:", value);
    if (value === 0) return 'quantity-zero';
    if (value > 0 && value < 5) return 'quantity-low';
    if (value >= 5 && value < 10) return 'quantity-medium';
    return 'quantity-high';
  };

  const renderTable = (item, itemCode) => {
    console.log(`Rendering table for itemCode: ${itemCode}`, item);
    return (
      <table className="excel-table" key={itemCode}>
        <thead>
          <tr>
            <th className="item-header">ITEM</th>
            <th className="code-header" colSpan={4}>
              {itemCode}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="label">COLOUR</td>
            <td className="label">CUTTING</td>
            <td className="label">TAPING</td>
            <td className="label">FINISHED</td>
            <td className="label">HOLD</td>
          </tr>
          {item.colors.map((color, index) => (
            <tr key={index}>
              <td className="color-cell">{color}</td>
              <td className={`quantity ${getCellClass(item.cuttingQuantities[index])}`}>
                {item.cuttingQuantities[index]}
              </td>
              <td className={`quantity ${getCellClass(item.tapingQuantities[index])}`}>
                {item.tapingQuantities[index]}
              </td>
              <td className={`quantity ${getCellClass(item.finished[index])}`}>
                {item.finished[index]}
              </td>
              <td className="quantity">
                <input
                  type="text"
                  value={item.hold[index]}
                  onChange={handleHoldChange(itemCode, index)}
                  className="hold-input"
                  pattern="\d*"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="dashboard">
      <div className="excel-toolbar">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter item code"
          className="search-input"
        />
      </div>

      <div className="excel-sheet">
        {loading ? (
          <p className="loading">Loading...</p>
        ) : (
          filteredItems.length > 0 ? (
            filteredItems.map(([itemCode, item]) => renderTable(item, itemCode))
          ) : (
            <p className="no-item-found">No items found</p>
          )
        )}
      </div>
    </div>
  );
};

export default Dashboard;