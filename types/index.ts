export interface User {
  id: string
  username: string
  role: "Admin" | "Manager" | "Viewer"
  createdAt: string
}

export interface Client {
  id: string
  nickname: string
  address: string
  city: string
  createdAt: string
}

export interface IncomeTransaction {
  id: string
  clientId: string
  amount: number
  date: string
  description: string
  projectId?: string
}

export interface Expense {
  id: string
  category: "Team" | "Tools" | "Vendor" | "Marketing"
  amount: number
  projectId?: string
  date: string
  description: string
}

export interface Project {
  id: string
  name: string
  clientId: string
  startDate: string
  endDate?: string
  status: "Planning" | "In Progress" | "Completed" | "On Hold"
}

export interface DashboardStats {
  totalClients: number
  totalProjects: number
  totalIncome: number
  totalExpenses: number
  totalProfit: number
  activeProjects: number
}

export interface ProjectProfit {
  projectId: string
  projectName: string
  clientName: string
  totalIncome: number
  totalExpenses: number
  profit: number
  profitMargin: number
}
