import React, { useState, useEffect, useMemo } from 'react';
import { getDocs, collection, setDoc, doc } from 'firebase/firestore';
import { db } from '../../../../config/firebase';
import './Tapped.css';

const Tapped = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsData, setItemsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [availableColors, setAvailableColors] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState({}); // To track changes in edit mode

  useEffect(() => {
    const fetchItemsData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'Tapping'));
        const data = {};
        querySnapshot.forEach((doc) => {
          const docData = doc.data();
          if (docData.itemCode && docData.tapedQuantities) {
            if (!data[docData.itemCode]) {
              data[docData.itemCode] = { tapedQuantities: {} };
            }
            Object.entries(docData.tapedQuantities).forEach(([color, quantity]) => {
              if (!data[docData.itemCode].tapedQuantities[color]) {
                data[docData.itemCode].tapedQuantities[color] = 0;
              }
              data[docData.itemCode].tapedQuantities[color] += quantity;
            });
          }
        });
        setItemsData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching Tapped data:", error);
        setLoading(false);
      }
    };

    const fetchColors = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'colors'));
        const colors = [];
        querySnapshot.forEach((doc) => {
          colors.push(doc.data().color);
        });
        setAvailableColors(colors);
      } catch (error) {
        console.error("Error fetching colors:", error);
      }
    };

    fetchItemsData();
    fetchColors();
  }, []);

  useEffect(() => {
    // Initialize editedData with the current itemsData
    setEditedData(Object.fromEntries(
      Object.entries(itemsData).map(([itemCode, data]) => [
        itemCode,
        { ...data.tapedQuantities }
      ])
    ));
  }, [itemsData]);

  const filteredItems = useMemo(() => {
    return Object.entries(itemsData).filter(([itemCode]) =>
      itemCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, itemsData]);

  const handleEditClick = () => setEditMode(prev => !prev);

  const handleQuantityChange = (itemCode, color, value) => {
    const parsedValue = parseInt(value, 10);
    const newValue = isNaN(parsedValue) ? '' : Math.max(0, parsedValue);

    setEditedData(prevData => ({
      ...prevData,
      [itemCode]: {
        ...prevData[itemCode],
        [color]: newValue,
      },
    }));
  };

  const saveChanges = async () => {
    try {
      await Promise.all(
        Object.entries(editedData).map(async ([itemCode, updatedQuantities]) => {
          const itemRef = doc(db, 'Tapping', itemCode);

          // Get current data from Firestore
          const currentData = itemsData[itemCode] || { tapedQuantities: {} };

          // Only update modified fields
          const changes = {};
          Object.entries(updatedQuantities).forEach(([color, newValue]) => {
            if (newValue !== currentData.tapedQuantities[color]) {
              changes[color] = newValue;
            }
          });

          if (Object.keys(changes).length > 0) {
            await setDoc(itemRef, { itemCode, tapedQuantities: changes }, { merge: true });
          }
        })
      );
      alert('Changes saved successfully!');
      setEditMode(false);
    } catch (error) {
      console.error("Error saving changes:", error);
      alert('Error saving changes. Please try again.');
    }
  };

  const getCellClass = (value) => {
    if (value === 0) return "quantity-zero";
    if (value > 0 && value < 5) return "quantity-low";
    if (value >= 5 && value < 10) return "quantity-medium";
    return "quantity-high";
  };

  return (
    <div className="tapped-list">
      <input
        type="text"
        placeholder="Search by item code..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />
      <button onClick={handleEditClick}>
        {editMode ? 'Cancel' : 'Edit'}
      </button>
      {editMode && (
        <button onClick={saveChanges} className="save-button">
          Save All Changes
        </button>
      )}
      <table className="excel-table">
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
                    const quantity = editMode ? editedData[itemCode]?.[color] || 0 : data.tapedQuantities[color] || 0;
                    return (
                      <td key={`${itemCode}-${color}`} className={`quantity ${getCellClass(quantity)}`}>
                        {editMode ? (
                          <input
                            type="number"
                            value={quantity}
                            onChange={(e) => handleQuantityChange(itemCode, color, e.target.value)}
                            min="0"
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

export default Tapped;
