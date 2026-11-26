import { delay, http, HttpResponse } from 'msw'

export const authHandlers = [
  http.post('/api/auth/login', async ({ request }) => {
    await delay(400)
    const { login, password } = (await request.json()) as {
      login: string
      password: string
    }
    if (login === 'admin' && password === 'admin') {
      return HttpResponse.json({ token: 'mock-token' })
    }
    return new HttpResponse(null, { status: 401 })
  }),
]