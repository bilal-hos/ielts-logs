import axios from "axios";
import type { LogsResponse, StatsResponse, Filters, Teacher, Student, AdminStats, DashboardStats } from "./types";

const ENV_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "");
const FALLBACK_URL = ENV_URL || "https://api.foodlens.cloud/api";

export function getBaseUrl(): string {
  // Env var always wins — avoids stale localStorage overriding dev/prod config
  if (ENV_URL) return ENV_URL;

  const stored = localStorage.getItem("apiBaseUrl");
  if (stored) return stored;

  return FALLBACK_URL;
}

export function setBaseUrl(url: string) {
  localStorage.setItem("apiBaseUrl", url.replace(/\/$/, ""));
}

export function getToken(): string {
  return localStorage.getItem("token") || "";
}

export function getStoredUser(): {
  email: string;
  role: string;
  name: string;
} | null {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

function api() {
  return axios.create({
    baseURL: getBaseUrl(),
    headers: { Authorization: `Bearer ${getToken()}` },
  });
}

export async function login(email: string, password: string) {
  const res = await axios.post(`${getBaseUrl()}/auth/login`, { email, password });
  const { token, user } = res.data;
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  return user;
}

export async function fetchLogs(
  page: number,
  filters: Filters,
): Promise<LogsResponse> {
  const params: Record<string, string | number> = {
    page,
    limit: filters.limit,
    sort: filters.sort,
  };
  if (filters.email) params.email = filters.email;
  if (filters.action) params.action = filters.action;
  if (filters.resourceType) params.resourceType = filters.resourceType;
  if (filters.status) params.status = filters.status;
  if (filters.startDate) params.startDate = filters.startDate;
  if (filters.endDate) params.endDate = filters.endDate;
  const res = await api().get("/logs", { params });
  return res.data;
}

export async function fetchStats(): Promise<StatsResponse> {
  const res = await api().get("/logs/statistics");
  return res.data;
}

export async function fetchAdminStats(): Promise<{ success: boolean; data: AdminStats }> {
  const res = await api().get("/admin/stats");
  return res.data;
}

export async function fetchDashboardStats(): Promise<{ success: boolean; data: DashboardStats }> {
  const res = await api().get("/admin/dashboard");
  return res.data;
}

export async function fetchTeachers(): Promise<{ success: boolean; count: number; data: Teacher[] }> {
  const res = await api().get("/admin/teachers");
  return res.data;
}

export async function createTeacher(payload: {
  name: string;
  surName?: string;
  email: string;
  password: string;
  bio?: string;
}): Promise<{ success: boolean; data: Teacher }> {
  const res = await api().post("/admin/teacher", payload);
  return res.data;
}

export async function deleteTeacher(id: string): Promise<void> {
  await api().delete(`/admin/teacher/${id}`);
}

export async function fetchStudents(): Promise<{ success: boolean; count: number; data: Student[] }> {
  const res = await api().get("/admin/students");
  return res.data;
}
