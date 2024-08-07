import React, { useState, useEffect, useCallback } from 'react';
import './AddItem.css';
import { addDoc, collection, getDocs, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../../../../config/firebase';

const AddItem = () => {
  const [currentDate, setCurrentDate] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [colorsAvailable, setColorsAvailable] = useState([]);
  const [colorOptions, setColorOptions] = useState([]);
  const [itemCodes, setItemCodes] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    setCurrentDate(new Date().toISOString().split('T')[0]);
    fetchColors();
    fetchItemCodes();
  }, []);

  const fetchColors = async () => {
    try {
      const colorSnapshot = await getDocs(collection(db, 'colors'));
      const colorsData = colorSnapshot.docs.map(doc => doc.data().color);
      setColorOptions(colorsData);
    } catch (error) {
      console.error("Error fetching colors:", error);
    }
  };

  const fetchItemCodes = async () => {
    try {
      const cuttingSnapshot = await getDocs(collection(db, 'itemCodes'));
      const codes = cuttingSnapshot.docs.map(doc => doc.data().code);
      setItemCodes(sortCodes(codes));
    } catch (error) {
      console.error("Error fetching item codes:", error);
    }
  };

  const sortCodes = useCallback((codes) => {
    return codes.sort((a, b) => {
      const isNumericA = /^[0-9]+$/.test(a);
      const isNumericB = /^[0-9]+$/.test(b);
      const isAlphaA = /^[a-zA-Z]+$/.test(a);
      const isAlphaB = /^[a-zA-Z]+$/.test(b);

      if (isNumericA && isNumericB) return a.localeCompare(b, undefined, { numeric: true });
      if (isNumericA) return -1;
      if (isNumericB) return 1;
      if (isAlphaA && isAlphaB) return a.localeCompare(b);
      if (isAlphaA) return 1;
      if (isAlphaB) return -1;
      return a.localeCompare(b);
    });
  }, []);

  const handleColorQuantityChange = useCallback((colorName, quantity) => {
    setColorsAvailable(prevColors =>
      prevColors.map(color =>
        color.colorName === colorName ? { ...color, quantity: parseInt(quantity, 10) || '' } : color
      )
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!itemCode) {
      alert("Please select an item code.");
      return;
    }

    if (!colorsAvailable.some(color => color.quantity > 0)) {
      alert("Please add at least one color with quantity.");
      return;
    }

    const newItem = {
      date: currentDate,
      itemCode,
      inStock: true,
      stockByColor: colorsAvailable.reduce((acc, color) => {
        if (color.quantity > 0) {
          acc[color.colorName] = color.quantity;
        }
        return acc;
      }, {}),
    };

    try {
      await updateOrAddCuttingItem(newItem);
      await updateWorkItems(itemCode, colorsAvailable);

      resetForm();
      showSuccessMessage("Stock added successfully!");
    } catch (error) {
      console.error('Error adding or updating item:', error);
      showSuccessMessage("Error adding or updating stock. Please try again.");
    }
  };

  const updateOrAddCuttingItem = async (newItem) => {
    const cuttingQuery = query(collection(db, 'Cutting'), where('itemCode', '==', newItem.itemCode));
    const cuttingSnapshot = await getDocs(cuttingQuery);

    if (!cuttingSnapshot.empty) {
      const existingDoc = cuttingSnapshot.docs[0];
      const existingItem = existingDoc.data();
      const updatedStockByColor = { ...existingItem.stockByColor };

      Object.entries(newItem.stockByColor).forEach(([color, quantity]) => {
        updatedStockByColor[color] = (updatedStockByColor[color] || 0) + quantity;
      });

      await updateDoc(existingDoc.ref, {
        'stockByColor': updatedStockByColor,
        'date': newItem.date,
        'inStock': true
      });

      console.log('Existing item updated in Cutting:', newItem.itemCode);
    } else {
      await addDoc(collection(db, "Cutting"), newItem);
      console.log('New item added to Cutting:', newItem);
    }
  };

  const updateWorkItems = async (itemCode, colorsAvailable) => {
    const workQuery = query(collection(db, 'Work'), where('newItem.itemCode', '==', itemCode));
    const workSnapshot = await getDocs(workQuery);
    
    const updatePromises = workSnapshot.docs.map(async (doc) => {
      const workItem = doc.data().newItem;
      const updatedStockByColor = { ...workItem.stockByColor };
      colorsAvailable.forEach(color => {
        if (updatedStockByColor[color.colorName] >= color.quantity) {
          updatedStockByColor[color.colorName] = parseInt(updatedStockByColor[color.colorName], 10) - color.quantity;
        }
      });
      return updateDoc(doc.ref, { 'newItem.stockByColor': updatedStockByColor });
    });

    await Promise.all(updatePromises);
  };

  const resetForm = () => {
    setItemCode('');
    setColorsAvailable([]);
  };

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="add-item-container">
      <h2 className="add-item-header">Add New Stock</h2>
      <form onSubmit={handleSubmit} className="add-item-form">
        <div className="add-item-row">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            value={currentDate}
            onChange={(e) => setCurrentDate(e.target.value)}
            required
          />
        </div>
        <div className="add-item-row">
          <label htmlFor="itemCode">Item Code</label>
          <select
            id="itemCode"
            value={itemCode}
            onChange={(e) => {
              setItemCode(e.target.value);
              setColorsAvailable(colorOptions.map(color => ({ colorName: color, quantity: '' })));
            }}
            required
            className="dropdown"
          >
            <option value="" disabled>Select item code</option>
            {itemCodes.map(code => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
        </div>
        {itemCode && colorsAvailable.map((color, index) => (
          <div key={index} className="add-item-row">
            <label>{color.colorName.toUpperCase()}</label>
            <input
              type="number"
              value={color.quantity}
              onChange={(e) => handleColorQuantityChange(color.colorName, e.target.value)}
              placeholder="Quantity"
              className="quantity-input"
            />
          </div>
        ))}
        <div className="add-item-row">
          <button type="submit" className="submit-button" disabled={!colorsAvailable.some(color => color.quantity > 0)}>
            Add Stock
          </button>
        </div>
      </form>
      {successMessage && <div className="success-message">{successMessage}</div>}
    </div>
  );
};

export default AddItem;