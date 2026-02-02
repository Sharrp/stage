import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { sendChatMessage } from './client'

describe('OpenRouter Client', () => {
  const mockFetch = vi.spyOn(global, 'fetch')
  const testApiKey = 'test-api-key-123'

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.OPENROUTER_API_KEY = testApiKey
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('successful chat completion', () => {
    it('calls the correct API endpoint', async () => {
      const mockResponse: any = {
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: 'Rhymes with line 1',
                role: 'assistant',
              },
              finish_reason: 'stop',
            },
          ],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 20,
          },
        }),
      }

      mockFetch.mockResolvedValue(mockResponse)

      await sendChatMessage('hello')

      expect(mockFetch).toHaveBeenCalledWith('https://openrouter.ai/api/v1/chat/completions', expect.any(Object))
    })

    it('returns the assistant message content', async () => {
      const expectedMessage = 'Sarcastic rhyming response'

      const mockResponse: any = {
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: expectedMessage,
                role: 'assistant',
              },
              finish_reason: 'stop',
            },
          ],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 20,
          },
        }),
      }

      mockFetch.mockResolvedValue(mockResponse)

      const result = await sendChatMessage('hello')

      expect(result).toBe(expectedMessage)
    })

    it('includes model in request body', async () => {
      const mockResponse: any = {
        ok: true,
        json: async () => ({
          choices: [
            {
              message: { content: 'test', role: 'assistant' },
              finish_reason: 'stop',
            },
          ],
          usage: { prompt_tokens: 0, completion_tokens: 0 },
        }),
      }

      mockFetch.mockResolvedValue(mockResponse)

      await sendChatMessage('test message')

      const callArgs = mockFetch.mock.calls[0]
      const requestBody = JSON.parse(callArgs[1]?.body as string)
      expect(requestBody.model).toBe('meta-llama/llama-3.1-8b-instruct')
    })

    it('includes messages with user role and content wrapped with prefix/suffix', async () => {
      const mockResponse: any = {
        ok: true,
        json: async () => ({
          choices: [
            {
              message: { content: 'test', role: 'assistant' },
              finish_reason: 'stop',
            },
          ],
          usage: { prompt_tokens: 0, completion_tokens: 0 },
        }),
      }

      mockFetch.mockResolvedValue(mockResponse)

      await sendChatMessage('hello world')

      const callArgs = mockFetch.mock.calls[0]
      const requestBody = JSON.parse(callArgs[1]?.body as string)
      const userMessage = requestBody.messages.find((m: any) => m.role === 'user')

      expect(userMessage).toBeDefined()
      expect(userMessage.content).toContain('We write a 2-line poem together')
      expect(userMessage.content).toContain('hello world')
      expect(userMessage.content).toContain('Second line (from you):')
    })

    it('includes system message in messages array', async () => {
      const mockResponse: any = {
        ok: true,
        json: async () => ({
          choices: [
            {
              message: { content: 'test', role: 'assistant' },
              finish_reason: 'stop',
            },
          ],
          usage: { prompt_tokens: 0, completion_tokens: 0 },
        }),
      }

      mockFetch.mockResolvedValue(mockResponse)

      await sendChatMessage('test')

      const callArgs = mockFetch.mock.calls[0]
      const requestBody = JSON.parse(callArgs[1]?.body as string)
      const systemMessage = requestBody.messages.find((m: any) => m.role === 'system')

      expect(systemMessage).toBeDefined()
      expect(systemMessage.content).toContain('2-line poem')
      expect(systemMessage.content).toContain('sarcastic')
      expect(systemMessage.content).toContain('rhyme')
    })
  })

  describe('API key handling', () => {
    it('includes Bearer token in Authorization header', async () => {
      const mockResponse: any = {
        ok: true,
        json: async () => ({
          choices: [
            {
              message: { content: 'test', role: 'assistant' },
              finish_reason: 'stop',
            },
          ],
          usage: { prompt_tokens: 0, completion_tokens: 0 },
        }),
      }

      mockFetch.mockResolvedValue(mockResponse)

      await sendChatMessage('test')

      const callArgs = mockFetch.mock.calls[0]
      const headers = callArgs[1]?.headers as Record<string, string>
      expect(headers.Authorization).toBe(`Bearer ${testApiKey}`)
    })

    it('uses OPENROUTER_API_KEY from environment', async () => {
      const customKey = 'custom-api-key-xyz'
      process.env.OPENROUTER_API_KEY = customKey

      const mockResponse: any = {
        ok: true,
        json: async () => ({
          choices: [
            {
              message: { content: 'test', role: 'assistant' },
              finish_reason: 'stop',
            },
          ],
          usage: { prompt_tokens: 0, completion_tokens: 0 },
        }),
      }

      mockFetch.mockResolvedValue(mockResponse)

      await sendChatMessage('test')

      const callArgs = mockFetch.mock.calls[0]
      const headers = callArgs[1]?.headers as Record<string, string>
      expect(headers.Authorization).toBe(`Bearer ${customKey}`)
    })

    it('throws error when API key is not set', async () => {
      delete process.env.OPENROUTER_API_KEY

      await expect(sendChatMessage('test')).rejects.toThrow('OPENROUTER_API_KEY environment variable is not set')
    })
  })

  describe('error handling', () => {
    it('throws error on API error response (401)', async () => {
      const mockResponse: any = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({
          error: {
            message: 'Invalid API key',
            type: 'invalid_request_error',
            code: 'invalid_api_key',
          },
        }),
      }

      mockFetch.mockResolvedValue(mockResponse)

      await expect(sendChatMessage('test')).rejects.toThrow('Failed to send message to OpenRouter')
      await expect(sendChatMessage('test')).rejects.toThrow('Invalid API key')
    })

    it('throws error on network failure', async () => {
      const networkError = new Error('Network connection failed')
      mockFetch.mockRejectedValue(networkError)

      await expect(sendChatMessage('test')).rejects.toThrow('Failed to send message to OpenRouter')
    })

    it('includes meaningful error message for fetch errors', async () => {
      const originalError = new Error('ECONNREFUSED: Connection refused')
      mockFetch.mockRejectedValue(originalError)

      await expect(sendChatMessage('test')).rejects.toThrow('ECONNREFUSED: Connection refused')
    })

    it('includes status text when error response lacks detailed message', async () => {
      const mockResponse: any = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({}),
      }

      mockFetch.mockResolvedValue(mockResponse)

      await expect(sendChatMessage('test')).rejects.toThrow('Internal Server Error')
    })
  })

  describe('request format', () => {
    it('sends POST request', async () => {
      const mockResponse: any = {
        ok: true,
        json: async () => ({
          choices: [
            {
              message: { content: 'test', role: 'assistant' },
              finish_reason: 'stop',
            },
          ],
          usage: { prompt_tokens: 0, completion_tokens: 0 },
        }),
      }

      mockFetch.mockResolvedValue(mockResponse)

      await sendChatMessage('test')

      const callArgs = mockFetch.mock.calls[0]
      expect(callArgs[1]?.method).toBe('POST')
    })

    it('sends JSON content type', async () => {
      const mockResponse: any = {
        ok: true,
        json: async () => ({
          choices: [
            {
              message: { content: 'test', role: 'assistant' },
              finish_reason: 'stop',
            },
          ],
          usage: { prompt_tokens: 0, completion_tokens: 0 },
        }),
      }

      mockFetch.mockResolvedValue(mockResponse)

      await sendChatMessage('test')

      const callArgs = mockFetch.mock.calls[0]
      const headers = callArgs[1]?.headers as Record<string, string>
      expect(headers['Content-Type']).toBe('application/json')
    })
  })
})
