import React from 'react'
import { Route, Routes } from 'react-router-dom'
import StockNav from './StockNav/StockNav'
import Finished from './Finished/Finished'
import Tapped from './Tapped/Tapped'
import Cutting from './Cutting/Cutting'

const app = () => {
  return (
    <div>
        <StockNav/>
        <Routes>
            <Route path='/Finished' element={<Finished/>}/>
            <Route path='/Tapped' element={<Tapped/>}/>
            <Route path='/Cutting' element={<Cutting/>}/>
        </Routes>
    </div>
  )
}

export default app