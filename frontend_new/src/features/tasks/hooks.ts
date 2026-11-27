import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { assignTask, fetchAssignees, fetchTasks } from './api'
import type { TasksQuery } from './types'

export function useTasks(query: TasksQuery) {
  return useQuery({
    queryKey: ['tasks', query],
    queryFn: () => fetchTasks(query),
    placeholderData: keepPreviousData,
  })
}

export function useAssignees() {
  return useQuery({ queryKey: ['task-assignees'], queryFn: fetchAssignees })
}

export function useAssignTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: assignTask,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  })
}