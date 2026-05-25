<template>
  <!-- Login -->
  <div v-if="!user" class="login-wrap">
    <div class="login-card">
      <div class="login-logo">
        <span class="logo-icon">IELTS</span>
        <h1>Admin Panel</h1>
        <p>IELTS Prep Management</p>
      </div>
      <div class="field">
        <label>Email</label>
        <input
          v-model="form.email"
          type="email"
          placeholder="admin@example.com"
          @keyup.enter="doLogin"
        />
      </div>
      <div class="field">
        <label>Password</label>
        <input
          v-model="form.password"
          type="password"
          placeholder="password"
          @keyup.enter="doLogin"
        />
      </div>
      <p v-if="loginError" class="error-msg">{{ loginError }}</p>
      <button class="btn-primary full" :disabled="busy" @click="doLogin">
        {{ busy ? 'Signing in...' : 'Sign in' }}
      </button>
    </div>
  </div>

  <!-- Shell -->
  <div v-else class="app">
    <header class="top-bar">
      <div class="top-bar-left">
        <span class="logo-text">IELTS Admin</span>
        <nav class="top-nav">
          <router-link to="/">Dashboard</router-link>
          <router-link to="/teachers">Teachers</router-link>
          <router-link to="/students">Students</router-link>
          <router-link to="/logs">Logs</router-link>
        </nav>
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
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { login } from './api'
import { useAuth } from './composables/useAuth'

const { user, logout } = useAuth()
const form = ref({ email: '', password: '' })
const loginError = ref('')
const busy = ref(false)

async function doLogin() {
  busy.value = true
  loginError.value = ''
  try {
    user.value = await login(form.value.email, form.value.password)
  } catch (e: any) {
    loginError.value = e?.response?.data?.message || 'Login failed'
  } finally {
    busy.value = false
  }
}

function doLogout() {
  logout()
}
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
.login-logo { text-align: center; margin-bottom: 8px; }
.logo-icon {
  font-size: 22px;
  font-weight: 800;
  color: #6366f1;
  display: block;
  margin-bottom: 6px;
}
.login-logo h1 { font-size: 22px; font-weight: 700; color: #1a1a2e; }
.login-logo p  { color: #6b7280; font-size: 13px; margin-top: 4px; }

/* App shell */
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.main-content {
  flex: 1;
  overflow: auto;
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
  white-space: nowrap;
}
.top-nav {
  display: flex;
  gap: 2px;
}
.top-nav a {
  color: #a0aec0;
  text-decoration: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.15s;
}
.top-nav a:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}
.top-nav a.router-link-active {
  color: #fff;
  background: rgba(99, 102, 241, 0.5);
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
.role-dot.admin   { background: #f6ad55; }
.role-dot.teacher { background: #68d391; }
.role-dot.student { background: #63b3ed; }

/* Stats bar */
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
.stat-card.success { border-color: #86efac; background: #f0fdf4; }
.stat-card.failure { border-color: #fca5a5; background: #fef2f2; }
.stat-card.action  { border-color: #93c5fd; background: #eff6ff; }
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
.filter-actions { display: flex; gap: 8px; }

/* Fields */
.field { display: flex; flex-direction: column; gap: 4px; }
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
.btn-primary:hover:not(:disabled) { background: #4f46e5; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-primary.full { width: 100%; padding: 11px; }
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
.btn-ghost:hover:not(:disabled) { background: #f3f4f6; }
.btn-ghost:disabled { opacity: 0.4; cursor: not-allowed; }

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
.log-table tbody tr:hover td { background: #fafafa; }
.log-table tbody tr.row-fail td { background: #fff8f8; }
.log-table tbody tr.row-fail:hover td { background: #fff0f0; }
.empty-row {
  text-align: center;
  color: #9ca3af;
  padding: 40px !important;
}
.cell-time { white-space: nowrap; color: #6b7280; font-size: 12px; }
.cell-email {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cell-desc { max-width: 220px; color: #374151; }
.cell-ip { white-space: nowrap; color: #9ca3af; font-size: 12px; font-family: monospace; }
.cell-err { max-width: 180px; color: #dc2626; font-size: 12px; }
.muted { color: #d1d5db; }

/* Badges */
.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}
.badge-success  { background: #dcfce7; color: #16a34a; }
.badge-fail     { background: #fee2e2; color: #dc2626; }
.badge-auth     { background: #ede9fe; color: #7c3aed; }
.badge-test     { background: #dbeafe; color: #1d4ed8; }
.badge-user     { background: #fef3c7; color: #92400e; }
.badge-danger   { background: #fee2e2; color: #b91c1c; }
.badge-access   { background: #f1f5f9; color: #475569; }
.badge-admin    { background: #fef3c7; color: #d97706; }
.badge-resource { background: #e0f2fe; color: #0369a1; }

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
.page-numbers { display: flex; gap: 4px; }
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
.page-btn:hover:not(:disabled):not(.ellipsis) { background: #f3f4f6; }
.page-btn.active {
  background: #6366f1;
  color: #fff;
  border-color: #6366f1;
  font-weight: 700;
}
.page-btn.ellipsis { border: none; cursor: default; color: #9ca3af; }
.page-info { font-size: 12px; color: #6b7280; margin-left: 8px; }

/* States */
.state-msg { text-align: center; padding: 60px; color: #6b7280; font-size: 15px; }
.state-msg.error { color: #dc2626; }
.error-msg { color: #dc2626; font-size: 13px; }

@media (max-width: 640px) {
  .top-bar { padding: 0 12px; }
  .top-nav a { padding: 5px 8px; font-size: 12px; }
  .filters-panel, .table-wrap { padding: 12px; }
  .stats-bar { padding: 12px; gap: 8px; }
  .stat-card { padding: 10px 14px; min-width: 70px; }
  .stat-num { font-size: 18px; }
}
</style>
