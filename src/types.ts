export interface LogEntry {
  _id: string
  userEmail: string
  action: string
  resourceType: string | null
  resourceId: string | null
  status: 'SUCCESS' | 'FAILURE'
  description: string
  ipAddress: string
  userAgent?: string
  errorMessage?: string
  metadata?: Record<string, unknown>
  createdAt: string
  user?: { name: string; email: string; role: string } | null
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface LogsResponse {
  success: boolean
  data: {
    logs: LogEntry[]
    pagination: Pagination
  }
}

export interface StatsResponse {
  success: boolean
  data: {
    actionStats: Record<string, number>
    statusStats: Record<string, number>
    resourceStats: Record<string, number>
    recentErrors: LogEntry[]
  }
}

export interface Filters {
  email: string
  action: string
  resourceType: string
  status: string
  startDate: string
  endDate: string
  sort: 'desc' | 'asc'
  limit: number
}
