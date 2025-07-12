import type { User } from '../types/auth'

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:3000'

interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  user?: User
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for authentication
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null) as { error?: string } | null
        throw new Error(errorData?.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json() as ApiResponse<T>
      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  async get<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  async post<T = unknown>(endpoint: string, data?: unknown, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T = unknown>(endpoint: string, data?: unknown, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }

  // Worker management methods
  async startWorker(threadId: number): Promise<ApiResponse<{ success: boolean; threadId: number; status: string; message: string }>> {
    return this.post<{ success: boolean; threadId: number; status: string; message: string }>('/api/workers/start', { threadId })
  }

  async stopWorker(threadId: number, reason?: string): Promise<ApiResponse<{ success: boolean; threadId: number; status: string; message: string }>> {
    return this.post<{ success: boolean; threadId: number; status: string; message: string }>(`/api/workers/stop/${threadId}`, { reason })
  }

  async forceStopWorker(threadId: number): Promise<ApiResponse<{ success: boolean; threadId: number; status: string; message: string }>> {
    return this.post<{ success: boolean; threadId: number; status: string; message: string }>(`/api/workers/force-stop/${threadId}`)
  }

  async getWorkerStatus(threadId: number): Promise<ApiResponse<{ threadId: number; status: string; isActive: boolean }>> {
    return this.get<{ threadId: number; status: string; isActive: boolean }>(`/api/workers/status/${threadId}`)
  }

  async listWorkers(): Promise<ApiResponse<{ workers: Array<{ threadId: number; status: string }>; totalActive: number }>> {
    return this.get<{ workers: Array<{ threadId: number; status: string }>; totalActive: number }>('/api/workers/list')
  }

  async stopAllWorkers(): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return this.post<{ success: boolean; message: string }>('/api/workers/stop-all')
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
