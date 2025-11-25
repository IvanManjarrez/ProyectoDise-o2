import React, { useState, useContext } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import Search from './pages/Search'
import Detail from './pages/Detail'
import Favorites from './pages/Favorites'
import Login from './pages/Login'
import { AuthContext } from './contexts/AuthContext'

export default function App() {
  const { token, logout, user } = useContext(AuthContext)
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="app">
      <header>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 style={{ margin: 0 }}>AR Art Gallery</h1>
          {user?.name && <small style={{ color: '#ddd' }}>Welcome, {user.name}</small>}
        </div>
        <nav>
          <Link to="/">Search</Link>
          <Link to="/favorites">Favorites</Link>
          {token ? (
            <button onClick={handleLogout} className="btn" style={{ marginLeft: 12 }}>Logout</button>
          ) : (
            <Link to="/login" style={{ marginLeft: 12 }} className="btn">Login</Link>
          )}
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Search />} />
          <Route path="/artworks/:id" element={<Detail />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </div>
  )
}
