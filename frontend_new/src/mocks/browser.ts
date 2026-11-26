import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'
import { templateDetailsHandlers } from './templateDetails'

export const worker = setupWorker(...handlers, ...templateDetailsHandlers)