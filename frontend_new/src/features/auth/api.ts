import { apiSend } from '../../shared/api/client'
import type { LoginPayload, LoginResponse } from './types'

export const login = (payload: LoginPayload) =>
  apiSend<LoginResponse>('POST', '/auth/login', payload)