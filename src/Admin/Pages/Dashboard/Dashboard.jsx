import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getDocs, collection, doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import './Dashboard.css';

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsData, setItemsData] = useState({});
  const [holdItems, setHoldItems] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const collections = ['Cutting', 'Finished', 'Tapping', 'HoldItem'];
        const data = {};
        const holdData = {};

        // Fetch available colors
        const colorsSnapshot = await getDocs(collection(db, 'colors'));
        const fetchedColors = colorsSnapshot.docs.map(doc => doc.data().color);
        console.log("Fetched colors:", fetchedColors);

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
                  colors: fetchedColors,
                  finished: Array(fetchedColors.length).fill(0),
                  cuttingQuantities: Array(fetchedColors.length).fill(0),
                  tapingQuantities: Array(fetchedColors.length).fill(0),
                };
              }

              let quantityField;
              if (collectionName === 'Cutting') {
                quantityField = 'stockByColor';
              } else if (collectionName === 'Finished') {
                quantityField = 'finishedQuantities';
              } else if (collectionName === 'Tapping') {
                quantityField = 'tapedQuantities';
              } else if (collectionName === 'HoldItem') {
                quantityField = 'quantity';
                holdData[docData.itemCode] = {};
                fetchedColors.forEach(color => {
                  holdData[docData.itemCode][color] = docData.quantity?.[color] || 0;
                });
              }

              if (docData[quantityField] && collectionName !== 'HoldItem') {
                const sourceData = docData[quantityField];
                if (typeof sourceData === 'object') {
                  Object.entries(sourceData).forEach(([color, quantity]) => {
                    if (data[docData.itemCode].colors.includes(color)) {
                      const colorIndex = data[docData.itemCode].colors.indexOf(color);
                      const parsedQuantity = parseInt(quantity, 10);
                      if (!isNaN(parsedQuantity)) {
                        if (collectionName === 'Cutting') {
                          data[docData.itemCode].cuttingQuantities[colorIndex] = parsedQuantity;
                        } else if (collectionName === 'Finished') {
                          data[docData.itemCode].finished[colorIndex] = parsedQuantity;
                        } else if (collectionName === 'Tapping') {
                          data[docData.itemCode].tapingQuantities[colorIndex] = parsedQuantity;
                        }
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
        console.log("Hold data:", holdData);

        setItemsData(data);
        setHoldItems(holdData);
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

  const handleHoldChange = useCallback(async (itemCode, color, newHoldValue) => {
    if (/^\d*$/.test(newHoldValue)) {
      const parsedValue = parseInt(newHoldValue, 10) || 0;
      setHoldItems((prevHoldItems) => ({
        ...prevHoldItems,
        [itemCode]: {
          ...prevHoldItems[itemCode],
          [color]: parsedValue,
        },
      }));

      try {
        const holdItemRef = doc(db, 'HoldItem', itemCode);
        const holdItemDoc = await getDoc(holdItemRef);

        if (holdItemDoc.exists()) {
          await updateDoc(holdItemRef, { 
            [`quantity.${color}`]: parsedValue,
            lastUpdated: new Date()
          });
        } else {
          await setDoc(holdItemRef, { 
            itemCode: itemCode,
            quantity: { [color]: parsedValue },
            lastUpdated: new Date()
          });
        }

        console.log(`Hold value updated for item code ${itemCode}, color ${color}`);
      } catch (error) {
        console.error("Error updating Firestore:", error);
      }
    }
  }, []);

  const getCellClass = useCallback((value) => {
    if (value === 0) return 'quantity-zero';
    if (value > 0 && value < 5) return 'quantity-low';
    if (value >= 5 && value < 10) return 'quantity-medium';
    return 'quantity-high';
  }, []);

  const hasNonZeroValues = useCallback((item) => {
    return item.cuttingQuantities.some(q => q > 0) ||
           item.tapingQuantities.some(q => q > 0) ||
           item.finished.some(q => q > 0) ||
           Object.values(holdItems[item.itemCode] || {}).some(q => q > 0);
  }, [holdItems]);

  const renderTable = useCallback((item, itemCode) => {
    if (!hasNonZeroValues(item)) return null;

    return (
      <div key={itemCode} className="item-table-container">
        <table className="excel-table">
          <thead>
            <tr>
              <th className="item-header">ITEM</th>
              <th className="code-header" colSpan={5}>
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
                    value={holdItems[itemCode]?.[color] || ''}
                    onChange={(e) => handleHoldChange(itemCode, color, e.target.value)}
                    className="hold-input"
                    pattern="\d*"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }, [getCellClass, hasNonZeroValues, handleHoldChange, holdItems]);

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
            filteredItems.map(([itemCode, item]) => renderTable({...item, itemCode}, itemCode)).filter(Boolean)
          ) : (
            <p className="no-item-found">No items found</p>
          )
        )}
      </div>
    </div>
  );
};

export default Dashboard;