export type ProjectStatus = 'in_progress' | 'review' | 'done' | 'overdue'

export interface Factory {
  id: string
  name: string
}

export interface Project {
  id: string
  name: string
  description: string
  status: ProjectStatus
  factory: Factory
  planStart: string // 'YYYY-MM-DD'
  planEnd: string // 'YYYY-MM-DD'
  progress: number // 0-100
}

export interface ProjectsQuery {
  search?: string
  status?: ProjectStatus
  factoryId?: string
  dateFrom?: string
  dateTo?: string
  page: number
  pageSize: number
}