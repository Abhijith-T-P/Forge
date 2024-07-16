import React from 'react'
import { Route, Routes } from 'react-router-dom'
import AddItem from './AddItems/AddItem'
import AddNav from './AddNav/AddNav'
import Tapped from './Tapped/Tapped'
import Finished from './Finished/Finished'

const Add = () => {
  return (
    <div className='Add'>
          <AddNav/>
        <Routes>
            {/* <Route path="/" element={<AddItem/>} /> */}
            <Route path="/AddItem" element={<AddItem/>} />
            <Route path="/Tapped" element={<Tapped/>} />
            <Route path="/Finished" element={<Finished/>} />
        </Routes>
    </div>
  )
}

export default Add