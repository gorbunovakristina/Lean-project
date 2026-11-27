import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchTemplateCategories, fetchTemplates } from './api'
import type { TemplatesQuery } from './types'

export function useTemplates(query: TemplatesQuery) {
  return useQuery({
    queryKey: ['templates', query],
    queryFn: () => fetchTemplates(query),
    placeholderData: keepPreviousData,
  })
}

export function useTemplateCategories() {
  return useQuery({
    queryKey: ['template-categories'],
    queryFn: fetchTemplateCategories,
  })
}