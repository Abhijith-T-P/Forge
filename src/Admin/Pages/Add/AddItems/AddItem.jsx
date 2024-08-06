import React, { useState, useEffect } from 'react';
import './AddItem.css';
import { addDoc, collection, getDocs, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../../../../config/firebase';

const AddItem = () => {
  const [currentDate, setCurrentDate] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [colorsAvailable, setColorsAvailable] = useState([]);
  const [colorOptions, setColorOptions] = useState([]);
  const [itemCodes, setItemCodes] = useState([]);
  const [hasColor, setHasColor] = useState(false);

  useEffect(() => {
    const today = new Date();
    setCurrentDate(today.toISOString().split('T')[0]);

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
    
        const customSort = (a, b) => {
          const isNumericA = /^[0-9]+$/.test(a);
          const isNumericB = /^[0-9]+$/.test(b);
          const isAlphaA = /^[a-zA-Z]+$/.test(a);
          const isAlphaB = /^[a-zA-Z]+$/.test(b);
    
          if (isNumericA && isNumericB) {
            return a.localeCompare(b, undefined, { numeric: true });
          }
          if (isNumericA) return -1;
          if (isNumericB) return 1;
          if (isAlphaA && isAlphaB) return a.localeCompare(b);
          if (isAlphaA) return 1;
          if (isAlphaB) return -1;
          return a.localeCompare(b);
        };
    
        const sortedCodes = codes.sort(customSort);
        setItemCodes(sortedCodes);
      } catch (error) {
        console.error("Error fetching item codes:", error);
      }
    };

    fetchColors();
    fetchItemCodes();
  }, []);

  const handleColorQuantityChange = (colorName, quantity) => {
    setColorsAvailable(prevColors =>
      prevColors.map(color =>
        color.colorName === colorName ? { ...color, quantity: parseInt(quantity, 10) || '' } : color
      )
    );
    setHasColor(colorsAvailable.some(color => color.quantity > 0));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!itemCode) {
      alert("Please select an item code.");
      return;
    }

    if (!hasColor) {
      alert("Please add at least one color with quantity.");
      return;
    }

    const newItem = {
      date: currentDate,
      itemCode,
      inStock: colorsAvailable.some(color => color.quantity > 0),
      stockByColor: colorsAvailable.reduce((acc, color) => {
        if (color.quantity > 0) {
          acc[color.colorName] = color.quantity;
        }
        return acc;
      }, {}),
    };

    try {
      const cuttingQuery = query(collection(db, 'Cutting'), where('itemCode', '==', itemCode));
      const cuttingSnapshot = await getDocs(cuttingQuery);

      if (!cuttingSnapshot.empty) {
        const existingDoc = cuttingSnapshot.docs[0];
        const existingItem = existingDoc.data();
        const updatedStockByColor = { ...existingItem.stockByColor };

        colorsAvailable.forEach(color => {
          if (updatedStockByColor[color.colorName]) {
            updatedStockByColor[color.colorName] = parseInt(updatedStockByColor[color.colorName], 10) + color.quantity;
          } else {
            updatedStockByColor[color.colorName] = color.quantity;
          }
        });

        await updateDoc(existingDoc.ref, {
          'stockByColor': updatedStockByColor,
          'date': currentDate,
          'inStock': Object.values(updatedStockByColor).some(qty => qty > 0)
        });

        console.log('Existing item updated in Cutting:', itemCode);
      } else {
        await addDoc(collection(db, "Cutting"), newItem);
        console.log('New item added to Cutting:', newItem);
      }

      const workQuery = query(collection(db, 'Work'), where('newItem.itemCode', '==', itemCode));
      const workSnapshot = await getDocs(workQuery);
      
      workSnapshot.forEach(async (doc) => {
        const workItem = doc.data().newItem;
        const updatedStockByColor = { ...workItem.stockByColor };
        colorsAvailable.forEach(color => {
          if (updatedStockByColor[color.colorName] >= color.quantity) {
            updatedStockByColor[color.colorName] = parseInt(updatedStockByColor[color.colorName], 10) - color.quantity;
          }
        });
        await updateDoc(doc.ref, { 'newItem.stockByColor': updatedStockByColor });
      });

      setItemCode('');
      setColorsAvailable([]);
      setHasColor(false);
      alert("Stock added successfully!");
    } catch (error) {
      console.error('Error adding or updating item:', error);
      alert("Error adding or updating stock. Please try again.");
    }
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
          <button type="submit" className="submit-button" disabled={!hasColor}>
            Add Stock
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddItem;
