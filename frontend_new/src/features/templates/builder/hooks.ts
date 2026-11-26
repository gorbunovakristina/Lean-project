import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchRoles, fetchTemplateDetails, saveTemplate } from './api'
import type { SaveTemplatePayload } from './types'

export function useTemplateDetails(id: string) {
  return useQuery({
    queryKey: ['template', id],
    queryFn: () => fetchTemplateDetails(id),
    enabled: !!id,
    refetchOnWindowFocus: false,
  })
}

export function useRoles() {
  return useQuery({ queryKey: ['roles'], queryFn: fetchRoles })
}

export function useSaveTemplate(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: SaveTemplatePayload) => saveTemplate(id, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(['template', id], data)
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })
}