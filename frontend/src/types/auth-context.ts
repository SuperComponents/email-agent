import type { User, LoginData, SignupData } from './auth'

export interface AuthContextType {
  user: User | null
  login: (data: LoginData) => Promise<void>
  signup: (data: SignupData) => Promise<void>
  logout: () => Promise<void>
  isLoading: boolean
  isAuthenticated: boolean
}