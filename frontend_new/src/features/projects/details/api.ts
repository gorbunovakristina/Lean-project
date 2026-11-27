import { apiGet } from '../../../shared/api/client'
import type { ProjectDetails } from './types'

export const fetchProjectDetails = (id: string) =>
  apiGet<ProjectDetails>(`/projects/${id}`)