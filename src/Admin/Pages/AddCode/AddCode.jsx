import React, { useState, useEffect } from 'react';
import { db } from '../../../config/firebase'; // Import Firebase configuration
import './AddCode.css';
import { addDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';

const AddCode = () => {
  const [codeInput, setCodeInput] = useState('');
  const [itemCodes, setItemCodes] = useState([]);

  useEffect(() => {
    // Fetch item codes from Firebase on component mount
    const fetchCodes = async () => {
      try {
        const codeCollection = await getDocs(collection(db, 'itemCodes'));
        const codesData = codeCollection.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setItemCodes(codesData);
      } catch (error) {
        console.error("Error fetching codes: ", error);
      }
    };

    fetchCodes();
  }, []);

  const handleAddCode = async () => {
    if (codeInput.trim() && !itemCodes.find((item) => item.code === codeInput)) {
      try {
        // Add code to Firebase
        await addDoc(collection(db, 'itemCodes'), { code: codeInput.trim() });
        setItemCodes([...itemCodes, { code: codeInput.trim() }]);
        alert('Code added successfully!');
        setCodeInput('');
      } catch (error) {
        console.error("Error adding code: ", error);
        alert('Failed to add code.');
      }
    } else if (itemCodes.find((item) => item.code === codeInput)) {
      alert('Code already exists.');
    } else {
      alert('Please enter a code.');
    }
  };

  const handleRemoveCode = async (codeToRemove) => {
    try {
      // Find and delete the code document in Firebase
      const q = query(collection(db, 'itemCodes'), where('code', '==', codeToRemove));
      const snapshot = await getDocs(q);
      snapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      setItemCodes(itemCodes.filter((item) => item.code !== codeToRemove));
    } catch (error) {
      console.error("Error removing code: ", error);
      alert('Failed to remove code.');
    }
  };

  // Function to sort item codes
  const sortedCodes = [...itemCodes].sort((a, b) => {
    const isNumA = /^[0-9]+$/.test(a.code);
    const isNumB = /^[0-9]+$/.test(b.code);

    if (isNumA && !isNumB) return -1;
    if (!isNumA && isNumB) return 1;

    const numA = parseInt(a.code, 10);
    const numB = parseInt(b.code, 10);

    if (isNaN(numA) && isNaN(numB)) {
      return a.code.localeCompare(b.code);
    }
    if (isNaN(numA)) return 1;
    if (isNaN(numB)) return -1;
    return numA - numB;
  });

  return (
    <div className="add-code-container">
      <h2 className="add-code-header">Add Item Code</h2>
      <div className="add-code-form">
        <input
          type="text"
          value={codeInput}
          onChange={(e) => setCodeInput(e.target.value)}
          placeholder="Enter item code"
          className="code-input"
        />
        <button type="button" onClick={handleAddCode} className="add-code-btn">
          Add Code
        </button>
      </div>
      <div className="codes-list">
        <h3>Available Codes</h3>
        <table className="codes-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedCodes.length > 0 ? (
              sortedCodes.map((item, index) => (
                <tr key={index}>
                  <td className="code-item">{item.code}</td>
                  <td>
                    <button type="button" onClick={() => handleRemoveCode(item.code)} className="remove-btn">
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="no-code-found">No codes found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AddCode;
