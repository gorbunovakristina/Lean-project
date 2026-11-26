import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'
import { templateDetailsHandlers } from './templateDetails'
import { projectsCreateHandlers } from './projectsCreate'

export const worker = setupWorker(
  ...handlers,
  ...templateDetailsHandlers,
  ...projectsCreateHandlers,
)