import { delay, http, HttpResponse } from 'msw'
import type { Employee, Enterprise, NewEmployee } from '../features/enterprises/types'

const enterprises: Enterprise[] = [
  {
    id: '1',
    name: 'ООО «Завод №1»',
    departments: [
      { id: 'd1', name: 'Цех №1' },
      { id: 'd2', name: 'Цех №2' },
      { id: 'd3', name: 'Сборочный цех' },
    ],
  },
  {
    id: '2',
    name: 'АО «Завод №2»',
    departments: [
      { id: 'd4', name: 'Цех №1' },
      { id: 'd5', name: 'Отдел качества' },
    ],
  },
  {
    id: '3',
    name: 'ООО «Завод №3»',
    departments: [
      { id: 'd6', name: 'Цех №1' },
      { id: 'd7', name: 'Склад' },
    ],
  },
]

const roles = ['Руководитель', 'Исполнитель', 'Аналитик', 'Сотрудник']

const allDepartments = enterprises.flatMap((e) =>
  e.departments.map((d) => ({ ...d, enterpriseId: e.id })),
)

const surnames = ['Иванов', 'Петров', 'Сидоров', 'Кузнецов', 'Смирнов', 'Попов']
const initials = ['И. И.', 'А. С.', 'Н. П.']
const positions = ['Начальник цеха', 'Инженер', 'Специалист', 'Мастер']

const employees: Employee[] = Array.from({ length: 27 }, (_, i) => {
  const dept = allDepartments[i % allDepartments.length]
  return {
    id: String(i + 1),
    fullName: `${surnames[i % surnames.length]} ${initials[i % initials.length]}`,
    position: positions[i % positions.length],
    departmentId: dept.id,
    departmentName: dept.name,
    enterpriseId: dept.enterpriseId,
    role: roles[i % 3],
    email: `user${i + 1}@example.com`,
  }
})

export const enterprisesHandlers = [
  http.get('/api/enterprises', () => HttpResponse.json(enterprises)),

  http.get('/api/employee-roles', () => HttpResponse.json(roles)),

  http.get('/api/employees', async ({ request }) => {
    await delay(300)
    const p = new URL(request.url).searchParams

    const search = p.get('search')?.toLowerCase()
    const enterpriseId = p.get('enterpriseId')
    const departmentId = p.get('departmentId')
    const page = Number(p.get('page') ?? 1)
    const pageSize = Number(p.get('pageSize') ?? 10)

    const filtered = employees.filter(
      (e) =>
        (!search ||
          e.fullName.toLowerCase().includes(search) ||
          e.email.toLowerCase().includes(search)) &&
        (!enterpriseId || e.enterpriseId === enterpriseId) &&
        (!departmentId || e.departmentId === departmentId),
    )

    return HttpResponse.json({
      items: filtered.slice((page - 1) * pageSize, page * pageSize),
      total: filtered.length,
    })
  }),

  http.post('/api/employees', async ({ request }) => {
    await delay(300)
    const body = (await request.json()) as NewEmployee
    const dept = allDepartments.find((d) => d.id === body.departmentId)
    if (!dept) return new HttpResponse(null, { status: 400 })

    const employee: Employee = {
      id: `e-${Date.now()}`,
      fullName: body.fullName,
      position: '—',
      departmentId: dept.id,
      departmentName: dept.name,
      enterpriseId: dept.enterpriseId,
      role: body.role,
      email: body.email,
    }
    employees.unshift(employee)
    return HttpResponse.json(employee, { status: 201 })
  }),
]