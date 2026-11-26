import { delay, http, HttpResponse } from 'msw'
import { factories, projects, templates } from './data'
import type { Project } from '../features/projects/types'

const toIso = (d: Date) => d.toISOString().slice(0, 10)

export const projectsCreateHandlers = [
  http.post('/api/projects', async ({ request }) => {
    await delay(400)
    const { templateId } = (await request.json()) as { templateId: string }
    const template = templates.find((t) => t.id === templateId)
    if (!template) return new HttpResponse(null, { status: 404 })

    const start = new Date()
    const end = new Date()
    end.setMonth(end.getMonth() + 3)

    const project: Project = {
      id: `p-${Date.now()}`,
      name: template.name,
      description: template.description,
      status: 'in_progress',
      factory: factories[0],
      planStart: toIso(start),
      planEnd: toIso(end),
      progress: 0,
    }
    projects.unshift(project) // новый проект сверху списка
    return HttpResponse.json(project, { status: 201 })
  }),
]