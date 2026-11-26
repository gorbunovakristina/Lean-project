import { apiGet, type Paginated } from '../../shared/api/client'
import type { Factory, Project, ProjectsQuery } from './types'

export const fetchProjects = (query: ProjectsQuery) =>
  apiGet<Paginated<Project>>('/projects', { ...query })

export const fetchFactories = () => apiGet<Factory[]>('/factories')