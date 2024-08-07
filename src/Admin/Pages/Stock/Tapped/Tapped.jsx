import React, { useState, useEffect, useMemo } from 'react';
import { getDocs, collection, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../../../config/firebase';
import './Tapped.css';

const Tapped = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsData, setItemsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [availableColors, setAvailableColors] = useState([]);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const fetchItemsData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'Tapping'));
        const data = {};
        querySnapshot.forEach((doc) => {
          const docData = doc.data();
          if (docData.itemCode && docData.tapedQuantities) {
            if (!data[doc.id]) {
              data[doc.id] = { ...docData, tapedQuantities: {} };
            }
            Object.entries(docData.tapedQuantities).forEach(([color, quantity]) => {
              if (!data[doc.id].tapedQuantities[color]) {
                data[doc.id].tapedQuantities[color] = 0;
              }
              data[doc.id].tapedQuantities[color] += quantity;
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

  const filteredItems = useMemo(() => {
    return Object.entries(itemsData).filter(([docId, data]) =>
      data.itemCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, itemsData]);

  const handleQuantityChange = (itemCode, color, value) => {
    setItemsData((prevData) => ({
      ...prevData,
      [itemCode]: {
        ...prevData[itemCode],
        tapedQuantities: {
          ...prevData[itemCode].tapedQuantities,
          [color]: parseInt(value, 10),
        },
      },
    }));
  };

  const saveChanges = async () => {
    try {
      await Promise.all(
        Object.entries(itemsData).map(async ([docId, data]) => {
          const itemRef = doc(db, 'Tapping', docId);
          await updateDoc(itemRef, {
            tapedQuantities: data.tapedQuantities,
          });
        })
      );
      alert('Changes saved successfully!');
      setEditMode(false);
    } catch (error) {
      console.error("Error saving changes:", error);
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
      <button onClick={() => setEditMode((prev) => !prev)}>
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
              filteredItems.map(([docId, data]) => (
                <tr key={docId}>
                  <td className="item-code">{data.itemCode}</td>
                  {availableColors.map((color) => {
                    const quantity = data.tapedQuantities[color] || 0;
                    return (
                      <td key={`${docId}-${color}`} className={`quantity ${getCellClass(quantity)}`}>
                        {editMode ? (
                          <input
                            type="number"
                            value={quantity}
                            onChange={(e) => handleQuantityChange(docId, color, e.target.value)}
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
