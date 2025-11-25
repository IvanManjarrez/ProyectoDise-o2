import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api'
import { AuthContext } from '../contexts/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setToken, setUser, refreshProfile } = useContext(AuthContext)

  async function onSubmit(e: any) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await login(email, password)
      // Expecting { token, user }
      if (res?.token) {
        const bearer = `Bearer ${res.token}`
        // use AuthContext to set token so App updates without reload
        setToken(bearer)
        // if backend returns user, set it too
        if (res.user) setUser(res.user)
        else await refreshProfile()
        navigate('/')
      } else {
        alert('Login failed')
      }
    } catch (err) {
      console.error(err)
      alert('Login error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: '24px auto' }}>
      <h2>Login</h2>
      <form onSubmit={onSubmit}>
        <div>
          <label>Email</label>
          <input value={email} onChange={(e: any) => setEmail(e.target.value)} type="email" />
        </div>
        <div>
          <label>Password</label>
          <input value={password} onChange={(e: any) => setPassword(e.target.value)} type="password" />
        </div>
        <div>
          <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        </div>
      </form>
    </div>
  )
}

