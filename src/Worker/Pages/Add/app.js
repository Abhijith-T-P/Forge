import React from 'react'
import { Route, Routes } from 'react-router-dom'
import AddItem from './AddItems/AddItem'
import AddNav from './AddNav/AddNav'
import TapePage from './TapePage/TapePage'
import FinishedPage from './FinishedPage/FinishedPage'

const Add = () => {
  return (
    <div className='Add'>
        <Routes>
            <Route path="/AddItem" element={<AddItem/>} />
            <Route path="/TapePage" element={<TapePage/>} />
            <Route path="/FinishedPage" element={<FinishedPage/>} />
            
            
        </Routes>
          <AddNav/>
    </div>
  )
}

export default Add