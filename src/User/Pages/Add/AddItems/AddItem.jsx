import React, { useState, useEffect } from 'react';
import './AddItem.css';
import { addDoc, collection, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../../../../config/firebase';

const AddItem = () => {
  const [currentDate, setCurrentDate] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [colorsAvailable, setColorsAvailable] = useState([]);
  const [colorInput, setColorInput] = useState('');
  const [colorQuantity, setColorQuantity] = useState('');

  const itemCodes = Array.from({ length: 10 }, (_, i) => `40${i + 4}`);

  useEffect(() => {
    const today = new Date();
    setCurrentDate(today.toISOString().split('T')[0]);
  }, []);

  const handleAddColor = () => {
    if (colorInput && colorQuantity && !colorsAvailable.find(color => color.colorName === colorInput)) {
      setColorsAvailable([...colorsAvailable, { colorName: colorInput, quantity: colorQuantity }]);
      setColorInput('');
      setColorQuantity('');
    }
  };

  const handleRemoveColor = (colorToRemove) => {
    setColorsAvailable(colorsAvailable.filter(color => color.colorName !== colorToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      await addDoc(collection(db, "Cutting"), newItem);
      console.log('New item added to Cutting:', newItem);

      const querySnapshot = await getDocs(collection(db, 'Work'));
      querySnapshot.forEach(async (doc) => {
        const workItem = doc.data().newItem;
        if (workItem.itemCode === itemCode) {
          const updatedStockByColor = { ...workItem.stockByColor };
          colorsAvailable.forEach(color => {
            if (updatedStockByColor[color.colorName] >= color.quantity) {
              updatedStockByColor[color.colorName] -= color.quantity;
            }
          });
          await updateDoc(doc.ref, { 'newItem.stockByColor': updatedStockByColor });
        }
      });

      // Reset form
      setItemCode('');
      setColorsAvailable([]);
      alert("Stock added successfully!");
    } catch (error) {
      console.error('Error adding item:', error);
      alert("Error adding stock. Please try again.");
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
                updatedColors[index].quantity = e.target.value;
                setColorsAvailable(updatedColors);
              }}
            />
            <button type="button" onClick={() => handleRemoveColor(color.colorName)} className="remove-btn">Remove</button>
          </div>
        ))}
        <div className="add-item-row">
          <input
            type="text"
            value={colorInput}
            onChange={(e) => setColorInput(e.target.value)}
            placeholder="Color name"
            className="color-input"
          />
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
          <button type="submit" className="submit-button">Add Stock</button>
        </div>
      </form>
    </div>
  );
};

export default AddItem;