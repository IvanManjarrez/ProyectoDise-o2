import React, { createContext, useState, useEffect } from 'react'
import { getMyProfile } from '../api'

export const AuthContext = createContext({} as any)

export const AuthProvider = ({ children }: any) => {
  const [token, setTokenState] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (token) {
      // try to fetch profile
      refreshProfile()
    } else {
      setUser(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  function setToken(t: string | null) {
    if (t) localStorage.setItem('token', t)
    else localStorage.removeItem('token')
    setTokenState(t)
  }

  async function refreshProfile() {
    if (!token) return
    try {
      const profile = await getMyProfile(token)
      setUser(profile)
    } catch (err) {
      console.warn('refreshProfile failed', err)
      setUser(null)
    }
  }

  function logout() {
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, setToken, user, setUser, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
