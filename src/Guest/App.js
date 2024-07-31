import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'

const App = () => {
  return (
    <div className='App'>
        <Routes>
            <Route path='/' element={<Login/>} />
            <Route path='/Login' element={<Login/>} />
            <Route path='/Register' element={<Register/>} />
        </Routes>
    </div>
  )
}

export default App