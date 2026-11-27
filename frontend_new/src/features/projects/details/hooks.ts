import { useQuery } from '@tanstack/react-query'
import { fetchProjectDetails } from './api'

export function useProjectDetails(id: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => fetchProjectDetails(id),
    enabled: !!id,
  })
}