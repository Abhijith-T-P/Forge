import React, { useState, useEffect, useMemo } from 'react';
import { getDocs, collection, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../../config/firebase';
import './Cutting.css';

const Cutting = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsData, setItemsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [availableColors, setAvailableColors] = useState([]);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const fetchItemsData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'Cutting'));
        const data = {};
        querySnapshot.forEach((doc) => {
          const docData = doc.data();
          data[doc.id] = docData;
        });
        setItemsData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching Cutting data:", error);
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
      itemsData[itemCode].itemCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, itemsData]);

  const handleQuantityChange = (itemCode, color, value) => {
    setItemsData((prevData) => ({
      ...prevData,
      [itemCode]: {
        ...prevData[itemCode],
        stockByColor: {
          ...prevData[itemCode].stockByColor,
          [color]: parseInt(value, 10),
        },
      },
    }));
  };

  const saveChanges = async () => {
    try {
      await Promise.all(
        Object.entries(itemsData).map(async ([docId, data]) => {
          const itemRef = doc(db, 'Cutting', docId);
          await updateDoc(itemRef, {
            stockByColor: data.stockByColor,
          });
        })
      );
      alert('Changes saved successfully!');
      setEditMode(false);
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  const deleteItem = async (itemCode) => {
    try {
      await deleteDoc(doc(db, 'Cutting', itemCode));
      setItemsData((prevData) => {
        const newData = { ...prevData };
        delete newData[itemCode];
        return newData;
      });
      alert('Item deleted successfully!');
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const getCellClass = (value) => {
    if (value === 0) return "quantity-zero";
    if (value > 0 && value < 5) return "quantity-low";
    if (value >= 5 && value < 10) return "quantity-medium";
    return "quantity-high";
  };

  return (
    <div className="cutting-list">
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
            {editMode && <th>Delete</th>}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={availableColors.length + 2} className="loading">Loading...</td>
            </tr>
          ) : (
            filteredItems.length > 0 ? (
              filteredItems.map(([docId, data]) => (
                <tr key={docId}>
                  <td className="item-code">{data.itemCode}</td>
                  {availableColors.map((color) => {
                    const quantity = data.stockByColor?.[color] || 0;
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
                  {editMode && (
                    <td>
                      <button onClick={() => deleteItem(docId)} className="delete-button">
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={availableColors.length + 2} className="no-item-found">No items found</td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Cutting;
