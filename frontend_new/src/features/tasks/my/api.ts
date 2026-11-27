import { apiGet, apiSend, type Paginated } from '../../../shared/api/client'
import type { MyTask, MyTasksQuery } from './types'

export const fetchMyTasks = (query: MyTasksQuery) =>
  apiGet<Paginated<MyTask>>('/my-tasks', { ...query })

export const completeMyTask = (payload: { id: string; reportFileName?: string }) =>
  apiSend<MyTask>('PUT', `/my-tasks/${payload.id}/complete`, {
    reportFileName: payload.reportFileName,
  })