export type PlanTaskStatus = 'in_progress' | 'not_started' | 'unassigned' | 'done'

export interface PlanTask {
  id: string
  order: number
  title: string
  role: string | null
  assignee: string | null
  dueDate: string // 'YYYY-MM-DD'
  status: PlanTaskStatus
}

export interface ProjectDetails {
  id: string
  name: string
  factoryName: string
  department: string
  tasks: PlanTask[]
}