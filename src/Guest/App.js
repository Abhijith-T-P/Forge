import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from './pages/Login/Login'
import ForgotPassword from './pages/ForgotPassword/ForgotPassword'

const App = () => {
  return (
    <div className='App'>
        <Routes>
            <Route path='/' element={<Login/>} />
            <Route path='/Login' element={<Login/>} />
            <Route path='/ForgotPassword' element={<ForgotPassword/>} />
            
        </Routes>
    </div>
  )
}

export default App