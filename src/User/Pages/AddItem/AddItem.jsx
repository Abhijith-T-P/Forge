import React, { useState } from 'react';
import './AddItem.css';

const AddItem = () => {
  const [itemName, setItemName] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [colorsAvailable, setColorsAvailable] = useState([]);
  const [colorInput, setColorInput] = useState('');
  const [colorQuantity, setColorQuantity] = useState('');

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const newItem = {
      itemName,
      itemCode,
      imageUrl,
      inStock: colorsAvailable.some(color => color.quantity > 0),
      stockByColor: colorsAvailable.reduce((acc, color) => {
        acc[color.colorName] = color.quantity;
        return acc;
      }, {}),
    };

    // Simulate adding item to stock (replace with actual backend call)
    console.log('New item added:', newItem);

    // Reset form
    setItemName('');
    setItemCode('');
    setImageUrl('');
    setColorsAvailable([]);
  };

  return (
    <div className="add-item-container">
      <h2>Add New Item to Stock</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="itemName">Item Name:</label>
          <input
            type="text"
            id="itemName"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="itemCode">Item Code:</label>
          <input
            type="text"
            id="itemCode"
            value={itemCode}
            onChange={(e) => setItemCode(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="imageUrl">Image URL:</label>
          <input
            type="text"
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="colorInput">Colors Available:</label>
          <div className="color-input">
            <input
              type="text"
              id="colorInput"
              value={colorInput}
              placeholder="Color name"
              onChange={(e) => setColorInput(e.target.value)}
            />
            <input
              type="number"
              id="colorQuantity"
              value={colorQuantity}
              placeholder="Quantity"
              onChange={(e) => setColorQuantity(e.target.value)}
            />
            <button type="button" onClick={handleAddColor}>Add Color</button>
          </div>
          <div className="colors-list">
            {colorsAvailable.map((color, index) => (
              <div key={index} className="color-item">
                {color.colorName} - {color.quantity}
                <button type="button" onClick={() => handleRemoveColor(color.colorName)}>Remove</button>
              </div>
            ))}
          </div>
        </div>
        <button type="submit" className="submit-button">Add Item</button>
      </form>
    </div>
  );
};

export default AddItem;
