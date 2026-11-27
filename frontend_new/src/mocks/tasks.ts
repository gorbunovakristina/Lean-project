import { delay, http, HttpResponse } from 'msw'
import type { Assignee, Task, TaskStatus } from '../features/tasks/types'

const CURRENT_USER_ID = 'u1'

const assignees: Assignee[] = [
  { id: 'u1', name: 'Иванов И. И.' },
  { id: 'u2', name: 'Петров С. В.' },
  { id: 'u3', name: 'Сидоров А. П.' },
]

const toIso = (d: Date) => d.toISOString().slice(0, 10)
const addDays = (days: number) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return toIso(d)
}

const samples: Array<{
  title: string
  description: string
  projectName: string
  status: TaskStatus
}> = [
  {
    title: 'Провести аудит рабочего места',
    description: 'Проверить текущее состояние участка 5S',
    projectName: 'Оптимизация',
    status: 'in_progress',
  },
  {
    title: 'Подготовить план мероприятий',
    description: 'План по улучшению участка',
    projectName: 'Оптимизация',
    status: 'not_started',
  },
  {
    title: 'Обучить сотрудников по 5S',
    description: 'Провести обучение для сотрудников',
    projectName: 'Внедрение 5S',
    status: 'unassigned',
  },
  {
    title: 'Проверить работу оборудования',
    description: 'Проверка оборудования на участке',
    projectName: 'Оптимизация',
    status: 'review',
  },
]

const tasks: Task[] = Array.from({ length: 22 }, (_, i) => {
  const s = samples[i % 4]
  return {
    id: String(i + 1),
    title: i >= 4 ? `${s.title} (${Math.floor(i / 4) + 1})` : s.title,
    description: s.description,
    projectName: s.projectName,
    status: s.status,
    dueDate: addDays(((i * 3) % 20) - 5),
    assignee: s.status === 'unassigned' ? null : assignees[i % 3],
  }
})

export const tasksHandlers = [
  http.get('/api/task-assignees', () => HttpResponse.json(assignees)),

  http.get('/api/tasks', async ({ request }) => {
    await delay(300)
    const p = new URL(request.url).searchParams

    const scope = p.get('scope') ?? 'my'
    const search = p.get('search')?.toLowerCase()
    const status = p.get('status')
    const deadline = p.get('deadline')
    const assigneeId = p.get('assigneeId')
    const page = Number(p.get('page') ?? 1)
    const pageSize = Number(p.get('pageSize') ?? 4)

    const today = toIso(new Date())
    const weekEnd = addDays(7)

    const filtered = tasks.filter(
      (t) =>
        (scope !== 'my' || t.assignee?.id === CURRENT_USER_ID) &&
        (!search || t.title.toLowerCase().includes(search)) &&
        (!status || t.status === status) &&
        (!assigneeId || t.assignee?.id === assigneeId) &&
        (!deadline ||
          (deadline === 'overdue' && t.dueDate < today) ||
          (deadline === 'week' && t.dueDate >= today && t.dueDate <= weekEnd) ||
          (deadline === 'later' && t.dueDate > weekEnd)),
    )

    return HttpResponse.json({
      items: filtered.slice((page - 1) * pageSize, page * pageSize),
      total: filtered.length,
    })
  }),

  http.put('/api/tasks/:id/assign', async ({ params, request }) => {
    await delay(300)
    const task = tasks.find((t) => t.id === params.id)
    const { assigneeId } = (await request.json()) as { assigneeId: string }
    const assignee = assignees.find((a) => a.id === assigneeId)
    if (!task || !assignee) return new HttpResponse(null, { status: 404 })

    task.assignee = assignee
    if (task.status === 'unassigned') task.status = 'not_started'
    return HttpResponse.json(task)
  }),
]