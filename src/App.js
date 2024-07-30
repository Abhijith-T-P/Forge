import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Admin from './Admin/App'
import Worker from './Worker/App'
// import Guest from './Guest/App'
import './App.css'

const App = () => {
  return (
    <div>
      <Routes>
        {/* <Route path="/*" element={<Guest/>} /> */}
        <Route path="/*" element={<Admin/>} />
        <Route path="/Admin/*" element={<Admin/>} />
        <Route path="/Worker/*" element={<Worker/>} />
      </Routes>
    </div>
  )
}

export default App