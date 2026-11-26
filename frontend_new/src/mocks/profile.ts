import { delay, http, HttpResponse } from 'msw'
import type {
  NotificationSettings,
  Profile,
  UpdateProfilePayload,
} from '../features/profile/types'

// хранится в памяти, при обновлении страницы возвращается к исходному
const profile: Profile = {
  fullName: 'Иванов Иван Алексеевич',
  email: 'ivagkyt@gmail.ru',
  position: 'Руководитель проекта',
  department: 'Отдел оптимизации',
  factory: 'АО «Завод №2»',
  notifications: { tasks: true, projects: true, weekly: true },
}

export const profileHandlers = [
  http.get('/api/profile', async () => {
    await delay(200)
    return HttpResponse.json(profile)
  }),

  http.put('/api/profile', async ({ request }) => {
    await delay(300)
    const body = (await request.json()) as UpdateProfilePayload
    profile.fullName = body.fullName
    profile.email = body.email
    return HttpResponse.json(profile)
  }),

  http.put('/api/profile/notifications', async ({ request }) => {
    await delay(200)
    profile.notifications = (await request.json()) as NotificationSettings
    return HttpResponse.json(profile)
  }),
]