import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createProject, fetchFactories, fetchProjects } from './api'
import type { ProjectsQuery } from './types'

export function useProjects(query: ProjectsQuery) {
  return useQuery({
    queryKey: ['projects', query],
    queryFn: () => fetchProjects(query),
    placeholderData: keepPreviousData,
  })
}

export function useFactories() {
  return useQuery({ queryKey: ['factories'], queryFn: fetchFactories })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createProject,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  })
}