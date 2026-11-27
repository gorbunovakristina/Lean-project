import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'
import { templateDetailsHandlers } from './templateDetails'
import { projectsCreateHandlers } from './projectsCreate'
import { enterprisesHandlers } from './enterprises'
import { profileHandlers } from './profile'
import { authHandlers } from './auth'
import { tasksHandlers } from './tasks'
import { myTasksHandlers } from './myTasks'

export const worker = setupWorker(
  ...handlers,
  ...templateDetailsHandlers,
  ...projectsCreateHandlers,
  ...enterprisesHandlers,
  ...profileHandlers,
  ...authHandlers,
  ...tasksHandlers,
  ...myTasksHandlers,
)