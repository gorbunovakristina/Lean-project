export interface NotificationSettings {
  tasks: boolean
  projects: boolean
  weekly: boolean
}

export type UserRole = 'employee' | 'head'

export interface Profile {
  fullName: string
  email: string
  position: string
  department: string
  factory: string
  role: UserRole
  notifications: NotificationSettings
}

export interface UpdateProfilePayload {
  fullName: string
  email: string
}