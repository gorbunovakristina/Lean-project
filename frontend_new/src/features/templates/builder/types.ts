import type { Template, TemplateStatus } from '../types'

export interface TemplateTask {
  id: string
  title: string
  description?: string
  role: string
  dueDays?: number
}

export interface TemplateDetails extends Template {
  tasks: TemplateTask[]
}

export interface SaveTemplatePayload {
  tasks: TemplateTask[]
  status?: TemplateStatus
}