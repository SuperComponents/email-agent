export interface User {
  id: number
  email: string
  name: string
  role: 'agent' | 'manager' | 'admin'
}

export interface LoginData {
  email: string
  password: string
}

export interface SignupData {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  user?: User
  error?: string
}
