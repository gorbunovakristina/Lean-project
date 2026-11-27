export type MyTaskStatus = 'in_progress' | 'review' | 'done'
export type MyTaskTab = 'active' | 'history'
export type MyTaskDeadline = 'overdue' | 'week' | 'later'

export interface TaskFile {
  name: string
  size: string
}

export interface MyTask {
  id: string
  title: string
  projectName: string
  status: MyTaskStatus
  dueDate: string // 'YYYY-MM-DD'
  description: string
  assignerName: string
  files: TaskFile[]
}

export interface MyTasksQuery {
  tab: MyTaskTab
  search?: string
  status?: MyTaskStatus
  deadline?: MyTaskDeadline
  page: number
  pageSize: number
}