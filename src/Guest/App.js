import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from './pages/Login'

const App = () => {
  return (
    <div className='App'>
        <Routes>
            <Route path='/' element={<Login/>} />
            <Route path='/Login' element={<Login/>} />
        </Routes>
    </div>
  )
}

export default App