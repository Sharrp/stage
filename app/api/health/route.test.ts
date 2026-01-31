import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from './route'

describe('Health Check API', () => {
  beforeEach(() => {
    // Mock process.uptime
    vi.spyOn(process, 'uptime').mockReturnValue(123.456)
  })

  it('returns 200 status code', async () => {
    const response = await GET()
    expect(response.status).toBe(200)
  })

  it('returns JSON with status ok', async () => {
    const response = await GET()
    const data = await response.json()
    expect(data.status).toBe('ok')
  })

  it('includes timestamp in response', async () => {
    const response = await GET()
    const data = await response.json()
    expect(data.timestamp).toBeDefined()
    expect(typeof data.timestamp).toBe('string')
    expect(new Date(data.timestamp).toString()).not.toBe('Invalid Date')
  })

  it('includes uptime in response', async () => {
    const response = await GET()
    const data = await response.json()
    expect(data.uptime).toBeDefined()
    expect(typeof data.uptime).toBe('number')
    expect(data.uptime).toBeGreaterThanOrEqual(0)
  })

  it('returns valid JSON structure', async () => {
    const response = await GET()
    const data = await response.json()
    expect(data).toHaveProperty('status')
    expect(data).toHaveProperty('timestamp')
    expect(data).toHaveProperty('uptime')
  })
})
