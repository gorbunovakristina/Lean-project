export interface Department {
  id: string
  name: string
}

export interface Enterprise {
  id: string
  name: string
  departments: Department[]
}

export interface Employee {
  id: string
  fullName: string
  position: string
  departmentId: string
  departmentName: string
  enterpriseId: string
  role: string
  email: string
}

export interface EmployeesQuery {
  search?: string
  enterpriseId?: string
  departmentId?: string
  page: number
  pageSize: number
}

export interface NewEmployee {
  fullName: string
  email: string
  role: string
  departmentId: string
}