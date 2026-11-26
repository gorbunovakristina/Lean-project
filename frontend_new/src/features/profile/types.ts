export interface NotificationSettings {
  tasks: boolean
  projects: boolean
  weekly: boolean
}

export interface Profile {
  fullName: string
  email: string
  position: string
  department: string
  factory: string
  notifications: NotificationSettings
}

export interface UpdateProfilePayload {
  fullName: string
  email: string
}