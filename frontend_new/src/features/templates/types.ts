export type TemplateStatus = 'published' | 'draft'

export interface TemplateCategory {
  id: string
  name: string
}

export interface Template {
  id: string
  name: string
  description: string
  status: TemplateStatus
  category: TemplateCategory
  tasksCount: number
}

export interface TemplatesQuery {
  search?: string
  categoryId?: string
  status?: TemplateStatus
  page: number
  pageSize: number
}