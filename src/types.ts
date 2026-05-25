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

export interface Teacher {
  _id: string
  name: string
  surName?: string
  email: string
  role: 'teacher'
  avatar?: string
  bio?: string
  createdAt?: string
}

export interface Student {
  _id: string
  name: string
  surName?: string
  email: string
  role: 'student'
  createdAt?: string
}

export interface AdminStats {
  students: number
  teacher: number
  admins: number
  total: number
}

export interface AttemptByType {
  _id: string
  total: number
  submitted: number
  inProgress: number
  avgScore: number | null
  passed: number
}

export interface DashboardStats {
  users: { students: number; teachers: number; admins: number; total: number }
  tests: { total: number; reading: number; listening: number; writing: number; speaking: number }
  attempts: {
    total: number
    submitted: number
    inProgress: number
    byType: AttemptByType[]
  }
  writing: {
    total: number
    pendingAi: number
    aiScored: number
    pendingTeacher: number
    teacherReviewed: number
    avgAiBand: number | null
  }
  speaking: {
    total: number
    pendingTeacher: number
    underReview: number
    teacherReviewed: number
  }
}
