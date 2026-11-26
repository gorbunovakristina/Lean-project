import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'
import { templateDetailsHandlers } from './templateDetails'
import { projectsCreateHandlers } from './projectsCreate'
import { enterprisesHandlers } from './enterprises'
import { profileHandlers } from './profile'
import { authHandlers } from './auth'

export const worker = setupWorker(
  ...handlers,
  ...templateDetailsHandlers,
  ...projectsCreateHandlers,
  ...enterprisesHandlers,
  ...profileHandlers,
  ...authHandlers,
)