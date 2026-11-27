import { delay, http, HttpResponse } from 'msw'
import { projects } from './data'
import type { PlanTask, PlanTaskStatus } from '../features/projects/details/types'

const toIso = (d: Date) => d.toISOString().slice(0, 10)
const addDays = (days: number) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return toIso(d)
}

const statuses: PlanTaskStatus[] = [
  'in_progress',
  'done',
  'not_started',
  'unassigned',
  'in_progress',
  'not_started',
  'unassigned',
]

const titles = [
  'Провести аудит текущего состояния',
  'Составить план внедрения 5S',
  'Провести обучение сотрудников',
  'Разметить рабочие зоны',
  'Внедрить стандарты хранения',
  'Провести повторный аудит',
  'Подвести итоги проекта',
]

const buildTasks = (): PlanTask[] =>
  statuses.map((status, i) => ({
    id: String(i + 1),
    order: i + 1,
    title: titles[i],
    role: status === 'unassigned' ? null : i % 2 === 0 ? 'Начальник участка' : 'Мастер смены',
    assignee: status === 'unassigned' ? null : i % 2 === 0 ? 'Иванов И. И.' : 'Петров С. В.',
    dueDate: addDays(i * 5 - 3),
    status,
  }))

export const projectDetailsHandlers = [
  http.get('/api/projects/:id', async ({ params }) => {
    await delay(300)
    const project = projects.find((p) => p.id === params.id)
    if (!project) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json({
      id: project.id,
      name: project.name,
      factoryName: project.factory.name,
      department: 'Производство',
      tasks: buildTasks(),
    })
  }),
]