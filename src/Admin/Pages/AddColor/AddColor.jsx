import React, { useState, useEffect } from 'react';
import { db } from '../../../config/firebase'; // Import the Firebase configuration
import './AddColor.css';
import { addDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';

const AddColor = () => {
  const [colorName, setColorName] = useState('');
  const [colors, setColors] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Fetch colors from Firebase on component mount
    const fetchColors = async () => {
      try {
        const colorCollection = await getDocs(collection(db, 'colors'));
        const colorsData = colorCollection.docs.map(doc => doc.data().color);
        setColors(colorsData);
      } catch (error) {
        console.error("Error fetching colors: ", error);
      }
    };

    fetchColors();
  }, []);

  const handleAddColor = async () => {
    if (colorName.trim() && !colors.includes(colorName.trim().toUpperCase())) {
      const newColor = colorName.trim().toUpperCase();

      try {
        // Add color to Firebase
        await addDoc(collection(db, 'colors'), { color: newColor });
        setColors([...colors, newColor]);
        setColorName('');
        setSuccessMessage('Color added successfully!');
        
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
      } catch (error) {
        console.error("Error adding color: ", error);
        alert('Failed to add color.');
      }
    }
  };

  const handleRemoveColor = async (colorToRemove) => {
    try {
      // Find and delete the color document in Firebase
      const q = query(collection(db, 'colors'), where('color', '==', colorToRemove));
      const snapshot = await getDocs(q);
      snapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      setColors(colors.filter(color => color !== colorToRemove));
    } catch (error) {
      console.error("Error removing color: ", error);
      alert('Failed to remove color.');
    }
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
      {successMessage && <div className="success-message">{successMessage}</div>}
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
