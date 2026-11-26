import { apiGet, apiSend } from '../../../shared/api/client'
import type { SaveTemplatePayload, TemplateDetails } from './types'

export const fetchTemplateDetails = (id: string) =>
  apiGet<TemplateDetails>(`/templates/${id}`)

export const fetchRoles = () => apiGet<string[]>('/roles')

export const saveTemplate = (id: string, payload: SaveTemplatePayload) =>
  apiSend<TemplateDetails>('PUT', `/templates/${id}`, payload)