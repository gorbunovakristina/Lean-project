import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchProfile, updateNotifications, updateProfile } from './api'

export function useProfile() {
  return useQuery({ queryKey: ['profile'], queryFn: fetchProfile })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => queryClient.setQueryData(['profile'], data),
  })
}

export function useUpdateNotifications() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateNotifications,
    onSuccess: (data) => queryClient.setQueryData(['profile'], data),
  })
}