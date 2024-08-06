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

  const filteredItems = useMemo(() => {
    return Object.entries(itemsData).filter(([itemCode]) =>
      itemCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, itemsData]);

  const handleEditClick = () => {
    setEditMode((prev) => !prev);
  };

  const handleQuantityChange = (itemCode, color, value) => {
    setItemsData((prevData) => ({
      ...prevData,
      [itemCode]: {
        ...prevData[itemCode],
        tapedQuantities: {
          ...prevData[itemCode].tapedQuantities,
          [color]: value,
        },
      },
    }));
  };

  const saveChanges = async () => {
    try {
      await Promise.all(
        Object.entries(itemsData).map(async ([itemCode, data]) => {
          const itemRef = doc(db, 'Tapping', itemCode);
          await updateDoc(itemRef, {
            tapedQuantities: data.tapedQuantities,
          });
        })
      );
      alert('Changes saved successfully!');
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
      <button onClick={handleEditClick}>
        {editMode ? 'Save Changes' : 'Edit'}
      </button>
      {editMode && (
        <button onClick={saveChanges}>
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
                    const quantity = data.tapedQuantities[color] || 0;
                    return (
                      <td key={`${itemCode}-${color}`} className={`quantity ${getCellClass(quantity)}`}>
                        {editMode ? (
                          <input
                            type="number"
                            value={quantity}
                            onChange={(e) => handleQuantityChange(itemCode, color, e.target.value)}
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
