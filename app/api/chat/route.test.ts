import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'

// Mock the OpenRouter client
vi.mock('@/lib/openrouter/client', () => ({
  sendChatMessage: vi.fn(),
}))

// Mock Supabase
const mockSupabaseGetUser = vi.fn()
const mockSupabaseUpsert = vi.fn()
const mockSupabaseSelect = vi.fn()
const mockSupabaseSingle = vi.fn()

vi.mock('@supabase/supabase-js', () => {
  return {
    createClient: vi.fn(() => ({
      auth: {
        getUser: mockSupabaseGetUser,
      },
      from: vi.fn(() => ({
        upsert: mockSupabaseUpsert,
      })),
    })),
  }
})

describe('Chat API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Set up environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

    // Default mock implementation for upsert chain
    mockSupabaseUpsert.mockReturnValue({
      select: mockSupabaseSelect,
    })
    mockSupabaseSelect.mockReturnValue({
      single: mockSupabaseSingle,
    })
  })

  describe('authentication', () => {
    it('returns 401 when authorization header is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: 'hello' }),
      })

      const response = await POST(request)

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toContain('Missing or invalid authorization header')
      expect(data.code).toBe('UNAUTHORIZED')
    })

    it('returns 401 when authorization header does not start with Bearer', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          authorization: 'Basic dGVzdDp0ZXN0',
        },
        body: JSON.stringify({ message: 'hello' }),
      })

      const response = await POST(request)

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.code).toBe('UNAUTHORIZED')
    })

    it('returns 401 when token verification fails', async () => {
      mockSupabaseGetUser.mockResolvedValue({ data: { user: null } })

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          authorization: 'Bearer invalid-token',
        },
        body: JSON.stringify({ message: 'hello' }),
      })

      const response = await POST(request)

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.code).toBe('INVALID_TOKEN')
    })

    it('verifies token with Supabase', async () => {
      const testToken = 'test-token-123'
      mockSupabaseGetUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      })
      mockSupabaseSingle.mockResolvedValue({
        data: {
          user_id: 'user-123',
          user_message: 'hello',
          assistant_message: 'test response',
          updated_at: new Date().toISOString(),
        },
      })

      const { sendChatMessage } = await import('@/lib/openrouter/client')
      vi.mocked(sendChatMessage).mockResolvedValue('test response')

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${testToken}`,
        },
        body: JSON.stringify({ message: 'hello' }),
      })

      await POST(request)

      expect(mockSupabaseGetUser).toHaveBeenCalledWith(testToken)
    })
  })

  describe('message validation', () => {
    beforeEach(() => {
      mockSupabaseGetUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      })
    })

    it('returns 400 when message field is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          authorization: 'Bearer test-token',
        },
        body: JSON.stringify({}),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('Message field is required')
      expect(data.code).toBe('BAD_REQUEST')
    })

    it('returns 400 when message is empty string', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          authorization: 'Bearer test-token',
        },
        body: JSON.stringify({ message: '' }),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('between 1 and 50 characters')
    })

    it('returns 400 when message is only whitespace', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          authorization: 'Bearer test-token',
        },
        body: JSON.stringify({ message: '   ' }),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('between 1 and 50 characters')
    })

    it('returns 400 when message exceeds 50 characters', async () => {
      const longMessage = 'a'.repeat(51)
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          authorization: 'Bearer test-token',
        },
        body: JSON.stringify({ message: longMessage }),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('between 1 and 50 characters')
    })

    it('returns 400 when message is not a string', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          authorization: 'Bearer test-token',
        },
        body: JSON.stringify({ message: 12345 }),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('Message must be a string')
    })

    it('returns 400 when request body is invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          authorization: 'Bearer test-token',
        },
        body: 'not json',
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('Invalid request body')
    })

    it('accepts message with exactly 50 characters', async () => {
      const message50Chars = 'a'.repeat(50)
      mockSupabaseSingle.mockResolvedValue({
        data: {
          user_id: 'user-123',
          user_message: message50Chars,
          assistant_message: 'test response',
          updated_at: new Date().toISOString(),
        },
      })

      const { sendChatMessage } = await import('@/lib/openrouter/client')
      vi.mocked(sendChatMessage).mockResolvedValue('test response')

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          authorization: 'Bearer test-token',
        },
        body: JSON.stringify({ message: message50Chars }),
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
    })

    it('trims whitespace from message', async () => {
      mockSupabaseSingle.mockResolvedValue({
        data: {
          user_id: 'user-123',
          user_message: 'hello',
          assistant_message: 'test response',
          updated_at: new Date().toISOString(),
        },
      })

      const { sendChatMessage } = await import('@/lib/openrouter/client')
      vi.mocked(sendChatMessage).mockResolvedValue('test response')

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          authorization: 'Bearer test-token',
        },
        body: JSON.stringify({ message: '  hello  ' }),
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(vi.mocked(sendChatMessage)).toHaveBeenCalledWith('hello')
    })
  })

  describe('successful chat completion', () => {
    beforeEach(() => {
      mockSupabaseGetUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      })
    })

    it('calls sendChatMessage with user message', async () => {
      const userMessage = 'hello world'
      mockSupabaseSingle.mockResolvedValue({
        data: {
          user_id: 'user-123',
          user_message: userMessage,
          assistant_message: 'test response',
          updated_at: new Date().toISOString(),
        },
      })

      const { sendChatMessage } = await import('@/lib/openrouter/client')
      vi.mocked(sendChatMessage).mockResolvedValue('test response')

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          authorization: 'Bearer test-token',
        },
        body: JSON.stringify({ message: userMessage }),
      })

      await POST(request)

      expect(vi.mocked(sendChatMessage)).toHaveBeenCalledWith(userMessage)
    })

    it('upserts chat message to database', async () => {
      mockSupabaseSingle.mockResolvedValue({
        data: {
          user_id: 'user-123',
          user_message: 'hello',
          assistant_message: 'test response',
          updated_at: new Date().toISOString(),
        },
      })

      const { sendChatMessage } = await import('@/lib/openrouter/client')
      vi.mocked(sendChatMessage).mockResolvedValue('test response')

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          authorization: 'Bearer test-token',
        },
        body: JSON.stringify({ message: 'hello' }),
      })

      await POST(request)

      expect(mockSupabaseUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-123',
          user_message: 'hello',
          assistant_message: 'test response',
        }),
        expect.any(Object)
      )
    })

    it('returns correct response format', async () => {
      const now = new Date().toISOString()
      mockSupabaseSingle.mockResolvedValue({
        data: {
          user_id: 'user-123',
          user_message: 'hello',
          assistant_message: 'test response',
          updated_at: now,
        },
      })

      const { sendChatMessage } = await import('@/lib/openrouter/client')
      vi.mocked(sendChatMessage).mockResolvedValue('test response')

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          authorization: 'Bearer test-token',
        },
        body: JSON.stringify({ message: 'hello' }),
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toEqual({
        userMessage: 'hello',
        assistantMessage: 'test response',
        updatedAt: now,
      })
    })

    it('returns 200 status on success', async () => {
      mockSupabaseSingle.mockResolvedValue({
        data: {
          user_id: 'user-123',
          user_message: 'hello',
          assistant_message: 'test response',
          updated_at: new Date().toISOString(),
        },
      })

      const { sendChatMessage } = await import('@/lib/openrouter/client')
      vi.mocked(sendChatMessage).mockResolvedValue('test response')

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          authorization: 'Bearer test-token',
        },
        body: JSON.stringify({ message: 'hello' }),
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
    })

    it('upsert updates existing message for same user', async () => {
      const firstTimestamp = '2024-01-01T10:00:00Z'
      const secondTimestamp = '2024-01-01T11:00:00Z'

      mockSupabaseSingle.mockResolvedValue({
        data: {
          user_id: 'user-123',
          user_message: 'new message',
          assistant_message: 'new response',
          updated_at: secondTimestamp,
        },
      })

      const { sendChatMessage } = await import('@/lib/openrouter/client')
      vi.mocked(sendChatMessage).mockResolvedValue('new response')

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          authorization: 'Bearer test-token',
        },
        body: JSON.stringify({ message: 'new message' }),
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      const data = await response.json()

      // Verify the upsert was called with onConflict: 'user_id'
      expect(mockSupabaseUpsert).toHaveBeenCalledWith(
        expect.any(Object),
        { onConflict: 'user_id' }
      )

      // Verify the returned data is the updated record
      expect(data.userMessage).toBe('new message')
      expect(data.assistantMessage).toBe('new response')
      expect(data.updatedAt).toBe(secondTimestamp)
    })
  })

  describe('error handling', () => {
    beforeEach(() => {
      mockSupabaseGetUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      })
    })

    it('returns 500 when sendChatMessage fails', async () => {
      const { sendChatMessage } = await import('@/lib/openrouter/client')
      vi.mocked(sendChatMessage).mockRejectedValue(new Error('OpenRouter API error'))

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          authorization: 'Bearer test-token',
        },
        body: JSON.stringify({ message: 'hello' }),
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.code).toBe('INTERNAL_ERROR')
    })

    it('returns 500 when database upsert fails', async () => {
      mockSupabaseSingle.mockResolvedValue({
        error: new Error('Database error'),
      })

      const { sendChatMessage } = await import('@/lib/openrouter/client')
      vi.mocked(sendChatMessage).mockResolvedValue('test response')

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          authorization: 'Bearer test-token',
        },
        body: JSON.stringify({ message: 'hello' }),
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.code).toBe('INTERNAL_ERROR')
    })

    it('includes error message in response', async () => {
      mockSupabaseSingle.mockResolvedValue({
        error: new Error('Specific database error'),
      })

      const { sendChatMessage } = await import('@/lib/openrouter/client')
      vi.mocked(sendChatMessage).mockResolvedValue('test response')

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          authorization: 'Bearer test-token',
        },
        body: JSON.stringify({ message: 'hello' }),
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBeDefined()
    })
  })
})
