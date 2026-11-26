const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

type Params = Record<string, string | number | undefined>

export async function apiGet<T>(path: string, params?: Params): Promise<T> {
  const url = new URL(BASE_URL + path, window.location.origin)
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value))
  })

  const response = await fetch(url)
  if (!response.ok) throw new Error(`Ошибка запроса: ${response.status}`)
  return response.json()
}

export interface Paginated<T> {
  items: T[]
  total: number
}