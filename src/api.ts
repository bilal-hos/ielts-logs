import axios from 'axios'
import type { LogsResponse, StatsResponse, Filters } from './types'

export function getBaseUrl(): string {
  return localStorage.getItem('apiBaseUrl') || import.meta.env.VITE_API_BASE_URL || ''
}

export function setBaseUrl(url: string) {
  localStorage.setItem('apiBaseUrl', url.replace(/\/$/, ''))
}

export function getToken(): string {
  return localStorage.getItem('token') || ''
}

export function getStoredUser(): { email: string; role: string; name: string } | null {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearAuth() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

function api() {
  return axios.create({
    baseURL: getBaseUrl(),
    headers: { Authorization: `Bearer ${getToken()}` },
  })
}

export async function login(email: string, password: string) {
  const res = await axios.post(`${getBaseUrl()}/auth/login`, { email, password })
  const { token, user } = res.data
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
  return user
}

export async function fetchLogs(page: number, filters: Filters): Promise<LogsResponse> {
  const params: Record<string, string | number> = { page, limit: filters.limit, sort: filters.sort }
  if (filters.email)        params.email        = filters.email
  if (filters.action)       params.action       = filters.action
  if (filters.resourceType) params.resourceType = filters.resourceType
  if (filters.status)       params.status       = filters.status
  if (filters.startDate)    params.startDate    = filters.startDate
  if (filters.endDate)      params.endDate      = filters.endDate
  const res = await api().get('/logs', { params })
  return res.data
}

export async function fetchStats(): Promise<StatsResponse> {
  const res = await api().get('/logs/statistics')
  return res.data
}
