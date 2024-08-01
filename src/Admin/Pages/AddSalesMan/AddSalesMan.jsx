import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import './AddSalesMan.css';

const AddSalesMan = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [salesmen, setSalesmen] = useState([]);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchSalesmen();
  }, []);

  const fetchSalesmen = async () => {
    const salesManCollection = collection(db, 'SalesMen');
    const salesManSnapshot = await getDocs(salesManCollection);
    const salesManList = salesManSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setSalesmen(salesManList);
  };

  const addSalesMan = async (e) => {
    e.preventDefault();
    if (username && password) {
      try {
        await addDoc(collection(db, 'SalesMen'), { username, password });
        setUsername('');
        setPassword('');
        fetchSalesmen();
      } catch (error) {
        console.error("Error adding salesman: ", error);
      }
    }
  };

  const resetPassword = async (id) => {
    if (newPassword) {
      const salesManRef = doc(db, 'SalesMen', id);
      await updateDoc(salesManRef, { password: newPassword });
      setNewPassword('');
      fetchSalesmen();
    }
  };

  return (
    <div className="add-salesman-container">
      <h2>Add SalesMan</h2>
      <form onSubmit={addSalesMan} className="salesman-form">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Add SalesMan</button>
      </form>
      <h3>SalesMan List</h3>
      <ul className="salesman-list">
        {salesmen.map(salesman => (
          <li key={salesman.id} className="salesman-item">
            <span>{salesman.username}</span>
            <div>
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button onClick={() => resetPassword(salesman.id)}>Reset Password</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AddSalesMan;
