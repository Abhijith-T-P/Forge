import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Admin from './Admin/App'
import Sales from './Sales/App'
import Guest from './Guest/App'
import './App.css'

const App = () => {
  return (
    <div>
      <Routes>
        {/* <Route path="/*" element={<Guest/>} /> */}
        <Route path="/*" element={<Guest/>} />
        <Route path="/Admin/*" element={<Admin/>} />
        <Route path="/Sales/*" element={<Sales/>} />
      </Routes>
    </div>
  )
}

export default App