import type { ProjectStatus } from './types'

export const STATUS_META: Record<
  ProjectStatus,
  { label: string; tone: 'green' | 'yellow' | 'gray' | 'red' }
> = {
  in_progress: { label: 'В работе', tone: 'green' },
  review: { label: 'На оценке', tone: 'yellow' },
  done: { label: 'Завершен', tone: 'gray' },
  overdue: { label: 'Просрочен', tone: 'red' },
}

export const PAGE_SIZE = 10