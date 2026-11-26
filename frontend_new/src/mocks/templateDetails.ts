import { delay, http, HttpResponse } from 'msw'
import { templates } from './data'
import type { TemplateStatus } from '../features/templates/types'
import type { TemplateTask } from '../features/templates/builder/types'

const roles = ['Начальник участка', 'Менеджер по обучению', 'Мастер смены', 'Технолог']

const defaultTasks: TemplateTask[] = [
  { id: 't1', title: 'Проведение аудит текущего состояния', role: 'Начальник участка' },
  { id: 't2', title: 'Составить план внедрения 5S', role: 'Начальник участка' },
  { id: 't3', title: 'Провести обучение сотрудников', role: 'Менеджер по обучению' },
]

const tasksByTemplate = new Map<string, TemplateTask[]>()

const getTasks = (id: string) =>
  tasksByTemplate.get(id) ?? defaultTasks.map((t) => ({ ...t }))

export const templateDetailsHandlers = [
  http.get('/api/roles', () => HttpResponse.json(roles)),

  http.get('/api/templates/:id', async ({ params }) => {
    await delay(200)
    const template = templates.find((t) => t.id === params.id)
    if (!template) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json({ ...template, tasks: getTasks(template.id) })
  }),

  http.put('/api/templates/:id', async ({ params, request }) => {
    await delay(300)
    const template = templates.find((t) => t.id === params.id)
    if (!template) return new HttpResponse(null, { status: 404 })

    const body = (await request.json()) as { tasks?: TemplateTask[]; status?: TemplateStatus }
    if (body.tasks) {
      tasksByTemplate.set(template.id, body.tasks)
      template.tasksCount = body.tasks.length
    }
    if (body.status) template.status = body.status

    return HttpResponse.json({ ...template, tasks: getTasks(template.id) })
  }),
]