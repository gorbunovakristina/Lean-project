import { apiGet, apiSend, type Paginated } from '../../shared/api/client'
import type { Assignee, Task, TasksQuery } from './types'

export const fetchTasks = (query: TasksQuery) =>
  apiGet<Paginated<Task>>('/tasks', { ...query })

export const fetchAssignees = () => apiGet<Assignee[]>('/task-assignees')

export const assignTask = (payload: { id: string; assigneeId: string }) =>
  apiSend<Task>('PUT', `/tasks/${payload.id}/assign`, { assigneeId: payload.assigneeId })