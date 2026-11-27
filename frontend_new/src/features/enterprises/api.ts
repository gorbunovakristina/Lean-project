import { apiGet, apiSend, type Paginated } from '../../shared/api/client'
import type { Employee, EmployeesQuery, Enterprise, NewEmployee } from './types'

export const fetchEnterprises = () => apiGet<Enterprise[]>('/enterprises')

export const fetchEmployees = (query: EmployeesQuery) =>
  apiGet<Paginated<Employee>>('/employees', { ...query })

export const fetchEmployeeRoles = () => apiGet<string[]>('/employee-roles')

export const addEmployee = (payload: NewEmployee) =>
  apiSend<Employee>('POST', '/employees', payload)