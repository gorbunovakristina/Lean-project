import type { TemplateStatus } from './types'

export const STATUS_META: Record<
  TemplateStatus,
  { label: string; tone: 'green' | 'gray' }
> = {
  published: { label: 'Опубликован', tone: 'green' },
  draft: { label: 'Черновик', tone: 'gray' },
}

export const PAGE_SIZE = 6