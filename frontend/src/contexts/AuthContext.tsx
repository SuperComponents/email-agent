import React, { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { User, LoginData, SignupData } from '../types/auth'
import { apiClient } from '../lib/api'
import { AuthContext } from './auth-context-instance'

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check if user is authenticated on mount
  useEffect(() => {
    void checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.get('/api/auth/me')
      
      if (response.success && response.user) {
        setUser(response.user)
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (data: LoginData) => {
    try {
      const response = await apiClient.post('/api/auth/login', data)
      
      if (response.success && response.user) {
        setUser(response.user)
        setIsAuthenticated(true)
      } else {
        throw new Error(response.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const signup = async (data: SignupData) => {
    try {
      const response = await apiClient.post('/api/auth/signup', data)
      
      if (response.success && response.user) {
        setUser(response.user)
        setIsAuthenticated(true)
      } else {
        throw new Error(response.error || 'Signup failed')
      }
    } catch (error) {
      console.error('Signup failed:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await apiClient.post('/api/auth/logout')
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  const value = {
    user,
    login,
    signup,
    logout,
    isLoading,
    isAuthenticated
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
