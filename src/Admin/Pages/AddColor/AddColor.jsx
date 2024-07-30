import React, { useState } from 'react';
import './AddColor.css';

const AddColor = () => {
  const [colorName, setColorName] = useState('');
  const [colors, setColors] = useState(['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE', 'ORANGE']);

  const handleAddColor = () => {
    if (colorName.trim() && !colors.includes(colorName.trim().toUpperCase())) {
      setColors([...colors, colorName.trim().toUpperCase()]);
      setColorName('');
      alert('Color added successfully!');
      console.log('Color entered successfully');
    }
  };

  const handleRemoveColor = (colorToRemove) => {
    setColors(colors.filter(color => color !== colorToRemove));
  };

  return (
    <div className="add-color-container">
      <h2 className="add-color-header">Add Color</h2>
      <div className="add-color-form">
        <input
          type="text"
          value={colorName}
          onChange={(e) => setColorName(e.target.value)}
          placeholder="Enter color name"
          className="color-input"
        />
        <button onClick={handleAddColor} className="add-color-btn">Add Color</button>
      </div>
      <div className="color-list">
        <h3>Available Colors</h3>
        <table className="color-table">
          <thead>
            <tr>
              <th>Color</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {colors.map((color, index) => (
              <tr key={index}>
                <td className="color-cell">{color}</td>
                <td>
                  <button onClick={() => handleRemoveColor(color)} className="delete-button">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AddColor;
