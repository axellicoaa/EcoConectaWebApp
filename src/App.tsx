import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Publish from './pages/Publish'
import Login from './pages/Login'
import Profile from './pages/Profile'
import ListingDetail from './pages/ListingDetail'
import CheckoutSuccess from './pages/CheckoutSuccess'

const App: React.FC = () => (
  <AuthProvider>
    <Router>
      <Routes>
        <Route path="/"                   element={<Home />} />
        <Route path="/login"              element={<Login />} />
        <Route path="/publicar"           element={<ProtectedRoute><Publish /></ProtectedRoute>} />
        <Route path="/perfil"             element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/listing/:id"        element={<ListingDetail />} />
        <Route path="/checkout/success"   element={<CheckoutSuccess />} />
      </Routes>
    </Router>
  </AuthProvider>
)

export default App
