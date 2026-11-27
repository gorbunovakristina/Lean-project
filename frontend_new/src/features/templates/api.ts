import { apiGet, type Paginated } from '../../shared/api/client'
import type { Template, TemplateCategory, TemplatesQuery } from './types'

export const fetchTemplates = (query: TemplatesQuery) =>
  apiGet<Paginated<Template>>('/templates', { ...query })

export const fetchTemplateCategories = () =>
  apiGet<TemplateCategory[]>('/template-categories')