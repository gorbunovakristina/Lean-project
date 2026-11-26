import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchFactories, fetchProjects } from './api'
import type { ProjectsQuery } from './types'

export function useProjects(query: ProjectsQuery) {
  return useQuery({
    queryKey: ['projects', query],
    queryFn: () => fetchProjects(query),
    placeholderData: keepPreviousData, // таблица не мигает при смене страницы
  })
}

export function useFactories() {
  return useQuery({ queryKey: ['factories'], queryFn: fetchFactories })
}