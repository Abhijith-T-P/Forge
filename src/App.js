import React from 'react'
import { Route, Routes } from 'react-router-dom'
import User from './User/App'
// import Guest from './Guest/App'
import './App.css'

const App = () => {
  return (
    <div>
      <Routes>
        {/* <Route path="/*" element={<Guest/>} /> */}
        <Route path="/User/*" element={<User/>} />
        <Route path="/*" element={<User/>} />
      </Routes>
    </div>
  )
}

export default App