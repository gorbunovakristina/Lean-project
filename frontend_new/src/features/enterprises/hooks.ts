import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addEmployee, fetchEmployeeRoles, fetchEmployees, fetchEnterprises } from './api'
import type { EmployeesQuery } from './types'

export function useEnterprises() {
  return useQuery({ queryKey: ['enterprises'], queryFn: fetchEnterprises })
}

export function useEmployees(query: EmployeesQuery) {
  return useQuery({
    queryKey: ['employees', query],
    queryFn: () => fetchEmployees(query),
    placeholderData: keepPreviousData,
  })
}

export function useEmployeeRoles() {
  return useQuery({ queryKey: ['employee-roles'], queryFn: fetchEmployeeRoles })
}

export function useAddEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: addEmployee,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  })
}