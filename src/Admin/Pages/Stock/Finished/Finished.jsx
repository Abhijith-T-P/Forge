import React, { useState, useEffect, useMemo } from 'react';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../../../config/firebase';
import './Finished.css';

const Finished = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsData, setItemsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [availableColors, setAvailableColors] = useState([]);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const fetchItemsData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'Finished'));
        const data = {};
        querySnapshot.forEach((doc) => {
          const docData = doc.data();
          if (docData.itemCode && docData.finishedQuantities) {
            data[docData.itemCode] = docData;
          }
        });
        setItemsData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching Finished data:", error);
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
        finishedQuantities: {
          ...prevData[itemCode].finishedQuantities,
          [color]: value,
        },
      },
    }));
  };

  const getCellClass = (value) => {
    if (value === 0) return "quantity-zero";
    if (value > 0 && value < 5) return "quantity-low";
    if (value >= 5 && value < 10) return "quantity-medium";
    return "quantity-high";
  };

  return (
    <div className="finished-list">
      <input
        type="text"
        placeholder="Search by item code..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />
      <button onClick={handleEditClick}>
        {editMode ? 'Save' : 'Edit'}
      </button>
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
                    const quantity = data.finishedQuantities?.[color] || 0;
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

export default Finished;
