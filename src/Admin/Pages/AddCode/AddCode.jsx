import React, { useState } from 'react';
import './AddCode.css';

const AddCode = () => {
  const [codeInput, setCodeInput] = useState('');
  const [itemCodes, setItemCodes] = useState([
    { code: '404' },
    { code: '404a' },
    { code: '405' },
    { code: '406b' },
    { code: '407' },
    { code: '407c' },
    { code: '409' }
  ]);

  const handleAddCode = () => {
    if (codeInput && !itemCodes.find((item) => item.code === codeInput)) {
      setItemCodes([...itemCodes, { code: codeInput }]);
      console.log('Code entered successfully');
      alert('Code added successfully!');
      setCodeInput('');
    } else if (itemCodes.find((item) => item.code === codeInput)) {
      alert('Code already exists.');
    } else {
      alert('Please enter a code.');
    }
  };

  const handleRemoveCode = (codeToRemove) => {
    setItemCodes(itemCodes.filter((item) => item.code !== codeToRemove));
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
