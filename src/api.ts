import axios from "axios";
import type { LogsResponse, StatsResponse, Filters } from "./types";

const FALLBACK_URL =
  import.meta.env.VITE_API_BASE_URL || "https://api.foodlens.cloud/api";

export function getBaseUrl(): string {
  const stored = localStorage.getItem("apiBaseUrl");

  // Sanitize stale URLs: strip http:// and any explicit port
  if (stored) {
    const isHttp = stored.startsWith("http://");
    const hasPort = /:\d+/.test(
      stored.replace("https://", "").replace("http://", ""),
    );

    if (isHttp || hasPort) {
      // Overwrite with the correct URL and use it
      const clean = FALLBACK_URL;
      localStorage.setItem("apiBaseUrl", clean);
      return clean;
    }

    return stored;
  }

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
  const res = await axios.post(`${getBaseUrl()}/auth/login`, {
    email,
    password,
  });
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
