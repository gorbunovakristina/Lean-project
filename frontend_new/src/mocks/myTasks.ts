import { delay, http, HttpResponse } from 'msw'
import type { MyTask, MyTaskStatus } from '../features/tasks/my/types'

const toIso = (d: Date) => d.toISOString().slice(0, 10)
const addDays = (days: number) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return toIso(d)
}

const statuses: MyTaskStatus[] = [
  'in_progress',
  'in_progress',
  'review',
  'in_progress',
  'review',
  'in_progress',
  'in_progress',
  'review',
  'done',
  'done',
  'done',
]

const myTasks: MyTask[] = statuses.map((status, i) => ({
  id: String(i + 1),
  title: i === 0 ? 'Провести аудит рабочего места' : `Провести аудит рабочего места (${i + 1})`,
  projectName: i % 2 === 0 ? 'Оптимизация' : 'Внедрение 5S',
  status,
  dueDate: addDays(((i * 4) % 18) - 3),
  description: 'Проверить текущее состояние рабочего места по методологии 5S',
  assignerName: 'Иванов А. А. (Начальник отдела)',
  files: [{ name: 'Методичка_5S.pdf', size: '2.4 МБ' }],
}))

export const myTasksHandlers = [
  http.get('/api/my-tasks', async ({ request }) => {
    await delay(300)
    const p = new URL(request.url).searchParams

    const tab = p.get('tab') ?? 'active'
    const search = p.get('search')?.toLowerCase()
    const status = p.get('status')
    const deadline = p.get('deadline')
    const page = Number(p.get('page') ?? 1)
    const pageSize = Number(p.get('pageSize') ?? 3)

    const today = toIso(new Date())
    const weekEnd = addDays(7)

    const filtered = myTasks.filter(
      (t) =>
        (tab === 'history' ? t.status === 'done' : t.status !== 'done') &&
        (!search || t.title.toLowerCase().includes(search)) &&
        (!status || t.status === status) &&
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

  http.put('/api/my-tasks/:id/complete', async ({ params }) => {
    await delay(400)
    const task = myTasks.find((t) => t.id === params.id)
    if (!task) return new HttpResponse(null, { status: 404 })
    task.status = 'done'
    return HttpResponse.json(task)
  }),
]