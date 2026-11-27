import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { completeMyTask, fetchMyTasks } from './api'
import type { MyTasksQuery } from './types'

export function useMyTasks(query: MyTasksQuery) {
  return useQuery({
    queryKey: ['my-tasks', query],
    queryFn: () => fetchMyTasks(query),
    placeholderData: keepPreviousData,
  })
}

export function useCompleteMyTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: completeMyTask,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-tasks'] }),
  })
}