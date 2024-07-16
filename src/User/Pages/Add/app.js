import React from 'react'
import { Route, Routes } from 'react-router-dom'
import AddItem from './AddItems/AddItem'
import AddNav from './AddNav/AddNav'

const Add = () => {
  return (
    <div className='Add'>
          <AddNav/>
        <Routes>
            {/* <Route path="/" element={<AddItem/>} /> */}
            <Route path="/AddItem" element={<AddItem/>} />
        </Routes>
    </div>
  )
}

export default Add