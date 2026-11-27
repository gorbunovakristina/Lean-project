import { apiGet, apiSend } from '../../shared/api/client'
import type { NotificationSettings, Profile, UpdateProfilePayload } from './types'

export const fetchProfile = () => apiGet<Profile>('/profile')

export const updateProfile = (payload: UpdateProfilePayload) =>
  apiSend<Profile>('PUT', '/profile', payload)

export const updateNotifications = (payload: NotificationSettings) =>
  apiSend<Profile>('PUT', '/profile/notifications', payload)