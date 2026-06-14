import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { AuthProvider } from '@refinedev/core'

// Mock axios before importing authProvider
const mockPost = vi.fn()
const mockGet = vi.fn()
const mockCreate = vi.fn(() => ({
  post: mockPost,
  get: mockGet,
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  },
}))

vi.mock('axios', () => ({
  default: {
    create: mockCreate,
  },
}))

describe('AuthProvider - Critical Path Tests', () => {
  let authProvider: AuthProvider

  beforeEach(async () => {
    // Clear localStorage before each test
    localStorage.clear()
    vi.clearAllMocks()

    // Dynamically import authProvider after mocks are set up
    const module = await import('@/providers/authProvider')
    authProvider = module.authProvider
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockResponse = {
        data: {
          token: 'test-token-123',
          user: {
            id: 1,
            email: 'test@example.com',
            fullName: 'Test User',
            role: 'lab_technician',
          },
        },
      }

      mockPost.mockResolvedValueOnce(mockResponse)

      const result = await authProvider.login({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(result.success).toBe(true)
      expect(result.redirectTo).toBe('/')
      expect(localStorage.getItem('token')).toBe('test-token-123')
      expect(localStorage.getItem('user')).toBeTruthy()
    })

    it('should handle login failure with invalid credentials', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Invalid credentials',
          },
          status: 401,
        },
      }

      mockPost.mockRejectedValueOnce(mockError)

      const result = await authProvider.login({
        email: 'wrong@example.com',
        password: 'wrongpassword',
      })

      expect(result.success).toBe(false)
      expect(result.error && result.error.message).toBe('Invalid credentials')
      expect(localStorage.getItem('token')).toBeNull()
    })

    it('should handle validation errors from backend', async () => {
      const mockError = {
        response: {
          data: {
            errors: [
              { message: 'Email is required', field: 'email' },
            ],
          },
          status: 422,
        },
      }

      mockPost.mockRejectedValueOnce(mockError)

      const result = await authProvider.login({
        email: '',
        password: 'password123',
      })

      expect(result.success).toBe(false)
      expect(result.error && result.error.message).toBe('Email is required')
    })
  })

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const mockResponse = {
        data: {
          data: {
            user: {
              id: 1,
              email: 'newuser@example.com',
              fullName: 'New User',
            },
          },
        },
      }

      mockPost.mockResolvedValueOnce(mockResponse)

      if (!authProvider.register) {
        throw new Error('register method not available')
      }

      const result = await authProvider.register({
        email: 'newuser@example.com',
        password: 'password123',
        passwordConfirmation: 'password123',
        fullName: 'New User',
      })

      expect(result.success).toBe(true)
      expect(result.redirectTo).toBe('/login')
    })

    it('should handle registration failure', async () => {
      const mockError = {
        response: {
          data: {
            errors: [
              { message: 'Email already exists', field: 'email' },
            ],
          },
          status: 422,
        },
      }

      mockPost.mockRejectedValueOnce(mockError)

      if (!authProvider.register) {
        throw new Error('register method not available')
      }

      const result = await authProvider.register({
        email: 'existing@example.com',
        password: 'password123',
        passwordConfirmation: 'password123',
        fullName: 'Test User',
      })

      expect(result.success).toBe(false)
      expect(result.error && result.error.message).toBe('Email already exists')
    })
  })

  describe('logout', () => {
    it('should successfully logout and clear storage', async () => {
      // Set up initial state
      localStorage.setItem('token', 'test-token')
      localStorage.setItem('user', JSON.stringify({ id: 1, email: 'test@example.com' }))

      mockPost.mockResolvedValueOnce({ data: {} })

      const result = await authProvider.logout({})

      expect(result.success).toBe(true)
      expect(result.redirectTo).toBe('/login')
      expect(localStorage.getItem('token')).toBeNull()
      expect(localStorage.getItem('user')).toBeNull()
    })

    it('should clear storage even if API call fails', async () => {
      localStorage.setItem('token', 'test-token')
      localStorage.setItem('user', JSON.stringify({ id: 1, email: 'test@example.com' }))

      mockPost.mockRejectedValueOnce(new Error('Network error'))

      const result = await authProvider.logout({})

      expect(result.success).toBe(true)
      expect(localStorage.getItem('token')).toBeNull()
      expect(localStorage.getItem('user')).toBeNull()
    })
  })

  describe('check', () => {
    it('should return authenticated when token exists', async () => {
      localStorage.setItem('token', 'test-token')

      const result = await authProvider.check()

      expect(result.authenticated).toBe(true)
    })

    it('should return not authenticated when token is missing', async () => {
      const result = await authProvider.check()

      expect(result.authenticated).toBe(false)
      expect(result.logout).toBe(true)
      expect(result.redirectTo).toBe('/login')
    })
  })

  describe('getIdentity', () => {
    it('should return user identity from localStorage', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'lab_technician',
      }
      localStorage.setItem('user', JSON.stringify(mockUser))

      const result = await authProvider.getIdentity?.()

      expect(result).toEqual(mockUser)
    })

    it('should return null when no user in localStorage', async () => {
      const result = await authProvider.getIdentity?.()

      expect(result).toBeNull()
    })
  })
})
