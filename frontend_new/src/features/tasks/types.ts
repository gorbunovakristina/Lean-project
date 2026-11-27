export type TaskStatus = 'in_progress' | 'not_started' | 'unassigned' | 'review'
export type TaskDeadline = 'overdue' | 'week' | 'later'
export type TaskScope = 'my' | 'department'

export interface Assignee {
  id: string
  name: string
}

export interface Task {
  id: string
  title: string
  description: string
  projectName: string
  status: TaskStatus
  dueDate: string // 'YYYY-MM-DD'
  assignee: Assignee | null
}

export interface TasksQuery {
  scope: TaskScope
  search?: string
  status?: TaskStatus
  deadline?: TaskDeadline
  assigneeId?: string
  page: number
  pageSize: number
}