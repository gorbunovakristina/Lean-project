import type { Factory, Project, ProjectStatus } from '../features/projects/types'
import type { Template, TemplateCategory } from '../features/templates/types'

// ---------- Проекты ----------

export const factories: Factory[] = [
  { id: '1', name: 'ООО «Завод №1»' },
  { id: '2', name: 'АО «Завод №2»' },
  { id: '3', name: 'ООО «Завод №3»' },
]

const names: Array<[string, string]> = [
  ['Оптимизация процесса сборки', 'Сокращение времени на сборку узла'],
  ['Снижение брака на участке', 'Уменьшение количества дефектов'],
  ['Автоматизация отчётности', 'Внедрение системы отчётности'],
  ['Оптимизация логистики', 'Сокращение перемещений деталей'],
]
const statuses: ProjectStatus[] = ['in_progress', 'review', 'done', 'overdue']
const progress = [40, 60, 100, 50]

export const projects: Project[] = Array.from({ length: 23 }, (_, i) => {
  const [name, description] = names[i % 4]
  const month = (i % 9) + 1
  return {
    id: String(i + 1),
    name: `${name} ${i >= 4 ? `(${Math.floor(i / 4) + 1})` : ''}`.trim(),
    description,
    status: statuses[i % 4],
    factory: factories[i % 3],
    planStart: `2026-0${month}-12`,
    planEnd: `2026-0${Math.min(month + 3, 9)}-30`,
    progress: progress[i % 4],
  }
})

// ---------- Шаблоны ----------

export const templateCategories: TemplateCategory[] = [
  { id: '1', name: '5S' },
  { id: '2', name: 'Диагностика' },
  { id: '3', name: 'Рабочее место' },
]

const templateSamples: Array<Omit<Template, 'id'>> = [
  {
    name: 'Стандарт внедрения 5S',
    description: 'Комплектующий шаблон для внедрения системы 5S',
    status: 'published',
    category: templateCategories[0],
    tasksCount: 12,
  },
  {
    name: 'Диагностика производства',
    description: 'Оценка текущего состояния участка',
    status: 'published',
    category: templateCategories[1],
    tasksCount: 8,
  },
  {
    name: 'Оптимизация рабочего места',
    description: 'Улучшение организации рабочего места',
    status: 'draft',
    category: templateCategories[2],
    tasksCount: 6,
  },
]

export const templates: Template[] = Array.from({ length: 14 }, (_, i) => {
  const sample = templateSamples[i % 3]
  return {
    ...sample,
    id: String(i + 1),
    name: i >= 3 ? `${sample.name} (${Math.floor(i / 3) + 1})` : sample.name,
  }
})