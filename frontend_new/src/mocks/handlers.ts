import { delay, http, HttpResponse } from 'msw'
import { factories, projects, templateCategories, templates } from './data'

export const handlers = [
  // ---------- Проекты ----------
  http.get('/api/factories', () => HttpResponse.json(factories)),

  http.get('/api/projects', async ({ request }) => {
    await delay(300) // имитация задержки сети
    const p = new URL(request.url).searchParams

    const search = p.get('search')?.toLowerCase()
    const status = p.get('status')
    const factoryId = p.get('factoryId')
    const dateFrom = p.get('dateFrom')
    const dateTo = p.get('dateTo')
    const page = Number(p.get('page') ?? 1)
    const pageSize = Number(p.get('pageSize') ?? 10)

    const filtered = projects.filter(
      (x) =>
        (!search || x.name.toLowerCase().includes(search)) &&
        (!status || x.status === status) &&
        (!factoryId || x.factory.id === factoryId) &&
        (!dateFrom || x.planEnd >= dateFrom) &&
        (!dateTo || x.planStart <= dateTo),
    )

    return HttpResponse.json({
      items: filtered.slice((page - 1) * pageSize, page * pageSize),
      total: filtered.length,
    })
  }),

  // ---------- Шаблоны ----------
  http.get('/api/template-categories', () => HttpResponse.json(templateCategories)),

  http.get('/api/templates', async ({ request }) => {
    await delay(300)
    const p = new URL(request.url).searchParams

    const search = p.get('search')?.toLowerCase()
    const status = p.get('status')
    const categoryId = p.get('categoryId')
    const page = Number(p.get('page') ?? 1)
    const pageSize = Number(p.get('pageSize') ?? 6)

    const filtered = templates.filter(
      (t) =>
        (!search || t.name.toLowerCase().includes(search)) &&
        (!status || t.status === status) &&
        (!categoryId || t.category.id === categoryId),
    )

    return HttpResponse.json({
      items: filtered.slice((page - 1) * pageSize, page * pageSize),
      total: filtered.length,
    })
  }),
]