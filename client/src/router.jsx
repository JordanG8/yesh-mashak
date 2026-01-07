/**
 * הגדרת נתיבים (Routes) של האפליקציה
 */

import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import History from './pages/History'

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/history" element={<History />} />
    </Routes>
  )
}

export default AppRouter
