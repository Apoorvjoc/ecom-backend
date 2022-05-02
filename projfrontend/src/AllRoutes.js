import React from 'react'
import {BrowserRouter , Routes , Route} from 'react-router-dom'
import Home from './core/Home'

function AllRoutes() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home/>}></Route>
        </Routes>
    </BrowserRouter>
  )
}

export default AllRoutes
