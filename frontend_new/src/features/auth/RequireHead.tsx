import { Navigate, Outlet } from 'react-router-dom'
import { useProfile } from '../profile/hooks'

export function RequireHead() {
  const { data: profile, isLoading } = useProfile()

  if (isLoading) return null
  if (profile?.role !== 'head') return <Navigate to="/tasks/my" replace />
  return <Outlet />
}