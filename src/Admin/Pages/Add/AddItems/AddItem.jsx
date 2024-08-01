import React, { useState, useEffect } from 'react';
import './AddItem.css';
import { addDoc, collection, getDocs, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../../../../config/firebase';

const AddItem = () => {
  const [currentDate, setCurrentDate] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [colorsAvailable, setColorsAvailable] = useState([]);
  const [colorInput, setColorInput] = useState('');
  const [colorQuantity, setColorQuantity] = useState('');
  const [colorOptions, setColorOptions] = useState([]);
  const [itemCodes, setItemCodes] = useState([]);
  const [hasColor, setHasColor] = useState(false);

  useEffect(() => {
    const today = new Date();
    setCurrentDate(today.toISOString().split('T')[0]);

    // Fetch colors from Firestore
    const fetchColors = async () => {
      try {
        const colorSnapshot = await getDocs(collection(db, 'colors'));
        const colorsData = colorSnapshot.docs.map(doc => doc.data().color);
        setColorOptions(colorsData);
      } catch (error) {
        console.error("Error fetching colors:", error);
      }
    };

    // Fetch item codes from Firestore
    const fetchItemCodes = async () => {
      try {
        const cuttingSnapshot = await getDocs(collection(db, 'itemCodes'));
        const codes = cuttingSnapshot.docs.map(doc => doc.data().code);
    
        // Custom sort function
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
    
        // Sort codes using the custom sort function
        const sortedCodes = codes.sort(customSort);
        setItemCodes(sortedCodes);
      } catch (error) {
        console.error("Error fetching item codes:", error);
      }
    };
    

    fetchColors();
    fetchItemCodes();
  }, []);

  const handleAddColor = () => {
    if (colorInput && colorQuantity > 0) {
      // Convert colorQuantity to a number
      const quantityToAdd = parseInt(colorQuantity, 10);

      setColorsAvailable(prevColors => {
        // Find if the color already exists
        const existingColorIndex = prevColors.findIndex(color => color.colorName === colorInput);

        if (existingColorIndex >= 0) {
          // Update the quantity of the existing color
          return prevColors.map((color, index) => 
            index === existingColorIndex 
              ? { ...color, quantity: parseInt(color.quantity, 10) + quantityToAdd }
              : color
          );
        } else {
          // Add new color
          return [...prevColors, { colorName: colorInput, quantity: quantityToAdd }];
        }
      });

      // Reset input fields
      setColorInput('');
      setColorQuantity('');
      setHasColor(true);
    } else {
      alert("Please enter a valid color and quantity.");
    }
  };

  const handleRemoveColor = (colorToRemove) => {
    const updatedColors = colorsAvailable.filter(color => color.colorName !== colorToRemove);
    setColorsAvailable(updatedColors);
    if (updatedColors.length === 0) {
      setHasColor(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if form fields are valid based on current state
    if (!itemCode) {
      alert("Please select an item code.");
      return;
    }

    if (colorsAvailable.length === 0) {
      alert("Please add at least one color with quantity.");
      return;
    }

    // Prepare the new item data
    const newItem = {
      date: currentDate,
      itemCode,
      inStock: colorsAvailable.some(color => color.quantity > 0),
      stockByColor: colorsAvailable.reduce((acc, color) => {
        acc[color.colorName] = color.quantity;
        return acc;
      }, {}),
    };

    try {
      // Fetch existing item from the Cutting collection
      const cuttingQuery = query(collection(db, 'Cutting'), where('itemCode', '==', itemCode));
      const cuttingSnapshot = await getDocs(cuttingQuery);

      if (!cuttingSnapshot.empty) {
        // Update existing item
        const existingDoc = cuttingSnapshot.docs[0];
        const existingItem = existingDoc.data();
        const updatedStockByColor = { ...existingItem.stockByColor };

        // Merge new quantities with existing quantities
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
        // Add new item
        await addDoc(collection(db, "Cutting"), newItem);
        console.log('New item added to Cutting:', newItem);
      }

      // Update Work collection
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

      // Reset form
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
            onChange={(e) => setItemCode(e.target.value)}
            required
            className="dropdown"
          >
            <option value="" disabled>Select item code</option>
            {itemCodes.map(code => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
        </div>
        {colorsAvailable.map((color, index) => (
          <div key={index} className="add-item-row">
            <label>{color.colorName.toUpperCase()}</label>
            <input
              type="number"
              value={color.quantity}
              onChange={(e) => {
                const updatedColors = [...colorsAvailable];
                updatedColors[index].quantity = parseInt(e.target.value, 10) || 0;
                setColorsAvailable(updatedColors);
              }}
            />
            <button type="button" onClick={() => handleRemoveColor(color.colorName)} className="remove-btn">Remove</button>
          </div>
        ))}
        <div className="add-item-row">
          <select
            value={colorInput}
            onChange={(e) => setColorInput(e.target.value)}
            placeholder="Color name"
            className="color-input"
          >
            <option value="" disabled>Select color</option>
            {colorOptions.map((color, index) => (
              <option key={index} value={color}>{color}</option>
            ))}
          </select>
          <input
            type="number"
            value={colorQuantity}
            onChange={(e) => setColorQuantity(e.target.value)}
            placeholder="Quantity"
            className="quantity-input"
          />
          <button type="button" onClick={handleAddColor} className="add-color-btn">Add Color</button>
        </div>
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