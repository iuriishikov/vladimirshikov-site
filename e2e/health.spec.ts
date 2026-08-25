import { expect, routes, test } from './fixtures/test'

interface HealthPayload {
  status: string
  version: string
  uptime: number
  timestamp: string
}

test.describe('health endpoint', () => {
  // Deployment gates on this route: if the shape drifts, the rollout stops
  // believing a healthy container and starts rolling back healthy releases.
  test('reports a machine-readable status', async ({ request }) => {
    const response = await request.get(routes.health)

    expect(response.status()).toBe(200)
    expect(response.headers()['content-type'] ?? '').toContain('application/json')

    const body = (await response.json()) as HealthPayload

    expect(body).toEqual({
      status: 'ok',
      version: expect.any(String),
      uptime: expect.any(Number),
      timestamp: expect.any(String),
    })

    // Process uptime in seconds — monotonic, so never negative.
    expect(body.uptime).toBeGreaterThanOrEqual(0)

    // Round-tripping proves the field is a real ISO-8601 instant rather than
    // something `new Date()` merely manages to parse.
    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp)
  })
})
