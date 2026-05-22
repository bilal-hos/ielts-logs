<template>
  <!-- Login -->
  <div v-if="!user" class="login-wrap">
    <div class="login-card">
      <div class="login-logo">
        <span class="logo-icon">IELTS</span>
        <h1>Admin Logs</h1>
        <p>Action Logs Dashboard</p>
      </div>
      <div class="field">
        <label>Email</label>
        <input
          v-model="loginForm.email"
          type="email"
          placeholder="admin@example.com"
          @keyup.enter="doLogin"
        />
      </div>
      <div class="field">
        <label>Password</label>
        <input
          v-model="loginForm.password"
          type="password"
          placeholder="password"
          @keyup.enter="doLogin"
        />
      </div>
      <p v-if="loginError" class="error-msg">{{ loginError }}</p>
      <button class="btn-primary full" :disabled="loggingIn" @click="doLogin">
        {{ loggingIn ? "Signing in..." : "Sign in" }}
      </button>
    </div>
  </div>

  <!-- Dashboard -->
  <div v-else class="app">
    <header class="top-bar">
      <div class="top-bar-left">
        <span class="logo-text">IELTS Logs</span>
        <span class="server-badge" :title="serverUrl">{{ serverLabel }}</span>
      </div>
      <div class="top-bar-right">
        <span class="user-badge">
          <span class="role-dot" :class="user.role" />
          {{ user.name || user.email }}
          <em>({{ user.role }})</em>
        </span>
        <button class="btn-ghost" @click="doLogout">Logout</button>
      </div>
    </header>

    <!-- Stats -->
    <div v-if="stats" class="stats-bar">
      <div class="stat-card">
        <span class="stat-num">{{ pagination?.total ?? 0 }}</span>
        <span class="stat-label">Total Logs</span>
      </div>
      <div class="stat-card success">
        <span class="stat-num">{{ stats.statusStats["SUCCESS"] ?? 0 }}</span>
        <span class="stat-label">Success</span>
      </div>
      <div class="stat-card failure">
        <span class="stat-num">{{ stats.statusStats["FAILURE"] ?? 0 }}</span>
        <span class="stat-label">Failures</span>
      </div>
      <div
        v-for="(count, action) in topActions"
        :key="action"
        class="stat-card action"
      >
        <span class="stat-num">{{ count }}</span>
        <span class="stat-label">{{ action }}</span>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-panel">
      <div class="filters-grid">
        <div class="field" v-if="user.role === 'admin'">
          <label>User Email</label>
          <input v-model="filters.email" placeholder="filter by email..." />
        </div>
        <div class="field">
          <label>Action</label>
          <select v-model="filters.action">
            <option value="">All Actions</option>
            <option v-for="a in ACTIONS" :key="a" :value="a">{{ a }}</option>
          </select>
        </div>
        <div class="field">
          <label>Resource Type</label>
          <select v-model="filters.resourceType">
            <option value="">All Resources</option>
            <option v-for="r in RESOURCE_TYPES" :key="r" :value="r">
              {{ r }}
            </option>
          </select>
        </div>
        <div class="field">
          <label>Status</label>
          <select v-model="filters.status">
            <option value="">All Statuses</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="FAILURE">FAILURE</option>
          </select>
        </div>
        <div class="field">
          <label>From Date</label>
          <input v-model="filters.startDate" type="date" />
        </div>
        <div class="field">
          <label>To Date</label>
          <input v-model="filters.endDate" type="date" />
        </div>
        <div class="field">
          <label>Sort</label>
          <select v-model="filters.sort">
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
        </div>
        <div class="field">
          <label>Per Page</label>
          <select v-model.number="filters.limit">
            <option :value="20">20</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
        </div>
      </div>
      <div class="filter-actions">
        <button class="btn-primary" @click="applyFilters">Apply</button>
        <button class="btn-ghost" @click="resetFilters">Reset</button>
      </div>
    </div>

    <div v-if="loading" class="state-msg">Loading...</div>
    <div v-else-if="fetchError" class="state-msg error">{{ fetchError }}</div>

    <!-- Table -->
    <div v-else class="table-wrap">
      <table class="log-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>User</th>
            <th>Action</th>
            <th>Resource</th>
            <th>Status</th>
            <th>Description</th>
            <th>IP</th>
            <th>Error</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="logs.length === 0">
            <td colspan="8" class="empty-row">
              No logs found for the selected filters.
            </td>
          </tr>
          <tr
            v-for="log in logs"
            :key="log._id"
            :class="{ 'row-fail': log.status === 'FAILURE' }"
          >
            <td class="cell-time" :title="log.createdAt">
              {{ formatTime(log.createdAt) }}
            </td>
            <td class="cell-email">{{ log.user?.email || log.userEmail }}</td>
            <td>
              <span class="badge" :class="actionClass(log.action)">{{
                log.action
              }}</span>
            </td>
            <td>
              <span v-if="log.resourceType" class="badge badge-resource">{{
                log.resourceType
              }}</span>
              <span v-else class="muted">-</span>
            </td>
            <td>
              <span
                class="badge"
                :class="
                  log.status === 'SUCCESS' ? 'badge-success' : 'badge-fail'
                "
              >
                {{ log.status }}
              </span>
            </td>
            <td class="cell-desc">{{ log.description || "-" }}</td>
            <td class="cell-ip">{{ log.ipAddress }}</td>
            <td class="cell-err">{{ log.errorMessage || "-" }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="pagination && pagination.totalPages > 0" class="pagination">
      <button
        class="btn-ghost"
        :disabled="!pagination.hasPrevPage"
        @click="goToPage(currentPage - 1)"
      >
        Prev
      </button>
      <div class="page-numbers">
        <button
          v-for="(p, i) in visiblePages"
          :key="i"
          class="page-btn"
          :class="{ active: p === currentPage, ellipsis: p === '...' }"
          :disabled="p === '...'"
          @click="typeof p === 'number' && goToPage(p)"
        >
          {{ p }}
        </button>
      </div>
      <button
        class="btn-ghost"
        :disabled="!pagination.hasNextPage"
        @click="goToPage(currentPage + 1)"
      >
        Next
      </button>
      <span class="page-info">
        {{ (currentPage - 1) * pagination.limit + 1 }}-{{
          Math.min(currentPage * pagination.limit, pagination.total)
        }}
        of {{ pagination.total }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  login,
  fetchLogs,
  fetchStats,
  getToken,
  getStoredUser,
  getBaseUrl,
  setBaseUrl,
  clearAuth,
} from "./api";
import type { LogEntry, Pagination, Filters } from "./types";

const ACTIONS = [
  "LOGIN",
  "LOGOUT",
  "START_TEST",
  "SUBMIT_TEST",
  "SAVE_ANSWER",
  "UPLOAD_AUDIO",
  "UPDATE_PROFILE",
  "DELETE_ACCOUNT",
  "ACCESS_RESOURCE",
  "ADMIN_ACTION",
  "ERROR",
];
const RESOURCE_TYPES = ["USER", "TEST", "ATTEMPT", "SUBMISSION", "SYSTEM"];

// Auth
const user = ref<{ name: string; email: string; role: string } | null>(null);
const serverUrl = ref(getBaseUrl());
const loginForm = ref({ email: "", password: "" });
const loginError = ref("");
const loggingIn = ref(false);

async function doLogin() {
  if (!serverUrl.value) {
    loginError.value = "Enter server URL first";
    return;
  }
  setBaseUrl(serverUrl.value);
  loggingIn.value = true;
  loginError.value = "";
  try {
    user.value = await login(loginForm.value.email, loginForm.value.password);
    await loadAll();
  } catch (e: any) {
    loginError.value = e?.response?.data?.message || "Login failed";
  } finally {
    loggingIn.value = false;
  }
}

function doLogout() {
  clearAuth();
  user.value = null;
  logs.value = [];
  stats.value = null;
  pagination.value = null;
}

// Filters
const defaultFilters = (): Filters => ({
  email: "",
  action: "",
  resourceType: "",
  status: "",
  startDate: "",
  endDate: "",
  sort: "desc",
  limit: 50,
});
const filters = ref<Filters>(defaultFilters());
const appliedFilters = ref<Filters>(defaultFilters());

function applyFilters() {
  appliedFilters.value = { ...filters.value };
  currentPage.value = 1;
  loadLogs();
}
function resetFilters() {
  filters.value = defaultFilters();
  appliedFilters.value = defaultFilters();
  currentPage.value = 1;
  loadLogs();
}

// Data
const logs = ref<LogEntry[]>([]);
const pagination = ref<Pagination | null>(null);
const stats = ref<{
  statusStats: Record<string, number>;
  actionStats: Record<string, number>;
} | null>(null);
const currentPage = ref(1);
const loading = ref(false);
const fetchError = ref("");

async function loadLogs() {
  loading.value = true;
  fetchError.value = "";
  try {
    const res = await fetchLogs(currentPage.value, appliedFilters.value);
    logs.value = res.data.logs;
    pagination.value = res.data.pagination;
  } catch (e: any) {
    fetchError.value = e?.response?.data?.message || "Failed to load logs";
  } finally {
    loading.value = false;
  }
}

async function loadStats() {
  try {
    const res = await fetchStats();
    stats.value = res.data;
  } catch {
    /* non-critical */
  }
}

async function loadAll() {
  await Promise.all([loadLogs(), loadStats()]);
}

function goToPage(p: number) {
  currentPage.value = p;
  loadLogs();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Computed
const serverLabel = computed(() => {
  try {
    return new URL(serverUrl.value).host;
  } catch {
    return serverUrl.value;
  }
});

const topActions = computed(() => {
  if (!stats.value) return {};
  return Object.fromEntries(
    Object.entries(stats.value.actionStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3),
  );
});

const visiblePages = computed((): (number | string)[] => {
  const total = pagination.value?.totalPages ?? 1;
  const cur = currentPage.value;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | string)[] = [1];
  if (cur > 3) pages.push("...");
  for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++)
    pages.push(i);
  if (cur < total - 2) pages.push("...");
  pages.push(total);
  return pages;
});

// Helpers
function formatTime(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) +
    " " +
    d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  );
}

function actionClass(action: string): string {
  const map: Record<string, string> = {
    LOGIN: "badge-auth",
    LOGOUT: "badge-auth",
    START_TEST: "badge-test",
    SUBMIT_TEST: "badge-test",
    SAVE_ANSWER: "badge-test",
    UPLOAD_AUDIO: "badge-test",
    UPDATE_PROFILE: "badge-user",
    DELETE_ACCOUNT: "badge-danger",
    ACCESS_RESOURCE: "badge-access",
    ADMIN_ACTION: "badge-admin",
    ERROR: "badge-fail",
  };
  return map[action] ?? "badge-access";
}

onMounted(() => {
  const stored = getStoredUser();
  if (stored && getToken()) {
    user.value = stored;
    loadAll();
  }
});
</script>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #f0f2f5;
  color: #1a1a2e;
  font-size: 14px;
}

/* Login */
.login-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%);
}
.login-card {
  background: #fff;
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.login-logo {
  text-align: center;
  margin-bottom: 8px;
}
.logo-icon {
  font-size: 22px;
  font-weight: 800;
  color: #6366f1;
  display: block;
  margin-bottom: 6px;
}
.login-logo h1 {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a2e;
}
.login-logo p {
  color: #6b7280;
  font-size: 13px;
  margin-top: 4px;
}

/* App */
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Top Bar */
.top-bar {
  background: #1a1a2e;
  color: #fff;
  padding: 0 24px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
.top-bar-left,
.top-bar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.logo-text {
  font-weight: 700;
  font-size: 16px;
}
.server-badge {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 2px 10px;
  font-size: 12px;
  color: #a0aec0;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.user-badge {
  font-size: 13px;
  color: #a0aec0;
  display: flex;
  align-items: center;
  gap: 6px;
}
.user-badge em {
  font-style: normal;
  color: #68d391;
  font-size: 11px;
}
.role-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #a0aec0;
}
.role-dot.admin {
  background: #f6ad55;
}
.role-dot.teacher {
  background: #68d391;
}
.role-dot.student {
  background: #63b3ed;
}

/* Stats */
.stats-bar {
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  overflow-x: auto;
}
.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 20px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  min-width: 90px;
}
.stat-card.success {
  border-color: #86efac;
  background: #f0fdf4;
}
.stat-card.failure {
  border-color: #fca5a5;
  background: #fef2f2;
}
.stat-card.action {
  border-color: #93c5fd;
  background: #eff6ff;
}
.stat-num {
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
}
.stat-label {
  font-size: 11px;
  color: #6b7280;
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Filters */
.filters-panel {
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  padding: 16px 24px;
}
.filters-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}
.filters-grid .field {
  min-width: 150px;
  flex: 1 1 150px;
}
.filter-actions {
  display: flex;
  gap: 8px;
}

/* Fields */
.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.field label {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.field input,
.field select {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 13px;
  outline: none;
  background: #fff;
  color: #1a1a2e;
  transition: border-color 0.15s;
}
.field input:focus,
.field select:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
}

/* Buttons */
.btn-primary {
  background: #6366f1;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 18px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-primary:hover:not(:disabled) {
  background: #4f46e5;
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-primary.full {
  width: 100%;
  padding: 11px;
}
.btn-ghost {
  background: transparent;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 8px 14px;
  font-size: 13px;
  cursor: pointer;
  color: #374151;
  transition: background 0.15s;
}
.btn-ghost:hover:not(:disabled) {
  background: #f3f4f6;
}
.btn-ghost:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Table */
.table-wrap {
  flex: 1;
  overflow-x: auto;
  padding: 16px 24px;
}
.log-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);
}
.log-table th {
  background: #f8fafc;
  border-bottom: 2px solid #e5e7eb;
  padding: 10px 12px;
  text-align: left;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #6b7280;
  white-space: nowrap;
}
.log-table td {
  padding: 9px 12px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: top;
  font-size: 13px;
}
.log-table tbody tr:hover td {
  background: #fafafa;
}
.log-table tbody tr.row-fail td {
  background: #fff8f8;
}
.log-table tbody tr.row-fail:hover td {
  background: #fff0f0;
}
.empty-row {
  text-align: center;
  color: #9ca3af;
  padding: 40px !important;
}
.cell-time {
  white-space: nowrap;
  color: #6b7280;
  font-size: 12px;
}
.cell-email {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cell-desc {
  max-width: 220px;
  color: #374151;
}
.cell-ip {
  white-space: nowrap;
  color: #9ca3af;
  font-size: 12px;
  font-family: monospace;
}
.cell-err {
  max-width: 180px;
  color: #dc2626;
  font-size: 12px;
}
.muted {
  color: #d1d5db;
}

/* Badges */
.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}
.badge-success {
  background: #dcfce7;
  color: #16a34a;
}
.badge-fail {
  background: #fee2e2;
  color: #dc2626;
}
.badge-auth {
  background: #ede9fe;
  color: #7c3aed;
}
.badge-test {
  background: #dbeafe;
  color: #1d4ed8;
}
.badge-user {
  background: #fef3c7;
  color: #92400e;
}
.badge-danger {
  background: #fee2e2;
  color: #b91c1c;
}
.badge-access {
  background: #f1f5f9;
  color: #475569;
}
.badge-admin {
  background: #fef3c7;
  color: #d97706;
}
.badge-resource {
  background: #e0f2fe;
  color: #0369a1;
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 16px 24px;
  background: #fff;
  border-top: 1px solid #e5e7eb;
  flex-wrap: wrap;
}
.page-numbers {
  display: flex;
  gap: 4px;
}
.page-btn {
  min-width: 34px;
  height: 34px;
  border: 1px solid #d1d5db;
  background: #fff;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.1s;
}
.page-btn:hover:not(:disabled):not(.ellipsis) {
  background: #f3f4f6;
}
.page-btn.active {
  background: #6366f1;
  color: #fff;
  border-color: #6366f1;
  font-weight: 700;
}
.page-btn.ellipsis {
  border: none;
  cursor: default;
  color: #9ca3af;
}
.page-info {
  font-size: 12px;
  color: #6b7280;
  margin-left: 8px;
}

/* States */
.state-msg {
  text-align: center;
  padding: 60px;
  color: #6b7280;
  font-size: 15px;
}
.state-msg.error {
  color: #dc2626;
}
.error-msg {
  color: #dc2626;
  font-size: 13px;
}

@media (max-width: 640px) {
  .top-bar,
  .filters-panel,
  .table-wrap {
    padding: 12px;
  }
  .stats-bar {
    padding: 12px;
    gap: 8px;
  }
  .stat-card {
    padding: 10px 14px;
    min-width: 70px;
  }
  .stat-num {
    font-size: 18px;
  }
}
</style>
