<template>
  <div>
    <!-- Stats -->
    <div v-if="stats" class="stats-bar">
      <div class="stat-card">
        <span class="stat-num">{{ pagination?.total ?? 0 }}</span>
        <span class="stat-label">Matching Logs</span>
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
        <div class="field" v-if="user?.role === 'admin'">
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
            <option v-for="r in RESOURCE_TYPES" :key="r" :value="r">{{ r }}</option>
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
            <td colspan="8" class="empty-row">No logs found for the selected filters.</td>
          </tr>
          <tr
            v-for="log in logs"
            :key="log._id"
            :class="{ 'row-fail': log.status === 'FAILURE' }"
          >
            <td class="cell-time" :title="log.createdAt">{{ formatTime(log.createdAt) }}</td>
            <td class="cell-email">{{ log.user?.email || log.userEmail }}</td>
            <td>
              <span class="badge" :class="actionClass(log.action)">{{ log.action }}</span>
            </td>
            <td>
              <span v-if="log.resourceType" class="badge badge-resource">{{ log.resourceType }}</span>
              <span v-else class="muted">-</span>
            </td>
            <td>
              <span class="badge" :class="log.status === 'SUCCESS' ? 'badge-success' : 'badge-fail'">
                {{ log.status }}
              </span>
            </td>
            <td class="cell-desc">{{ log.description || '-' }}</td>
            <td class="cell-ip">{{ log.ipAddress }}</td>
            <td class="cell-err">{{ log.errorMessage || '-' }}</td>
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
        {{ (currentPage - 1) * pagination.limit + 1 }}–{{
          Math.min(currentPage * pagination.limit, pagination.total)
        }}
        of {{ pagination.total }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { fetchLogs, fetchStats } from '../api'
import { useAuth } from '../composables/useAuth'
import type { LogEntry, Pagination, Filters } from '../types'

const { user } = useAuth()

const ACTIONS = [
  'LOGIN', 'LOGOUT', 'START_TEST', 'SUBMIT_TEST', 'SAVE_ANSWER',
  'UPLOAD_AUDIO', 'UPDATE_PROFILE', 'DELETE_ACCOUNT', 'ACCESS_RESOURCE',
  'ADMIN_ACTION', 'ERROR',
]
const RESOURCE_TYPES = ['USER', 'TEST', 'ATTEMPT', 'SUBMISSION', 'SYSTEM']

const defaultFilters = (): Filters => ({
  email: '', action: '', resourceType: '', status: '',
  startDate: '', endDate: '', sort: 'desc', limit: 50,
})

const filters = ref<Filters>(defaultFilters())
const appliedFilters = ref<Filters>(defaultFilters())

const logs = ref<LogEntry[]>([])
const pagination = ref<Pagination | null>(null)
const stats = ref<{
  statusStats: Record<string, number>
  actionStats: Record<string, number>
} | null>(null)
const currentPage = ref(1)
const loading = ref(false)
const fetchError = ref('')

async function loadLogs() {
  loading.value = true
  fetchError.value = ''
  try {
    const res = await fetchLogs(currentPage.value, appliedFilters.value)
    logs.value = res.data.logs
    pagination.value = res.data.pagination
  } catch (e: any) {
    fetchError.value = e?.response?.data?.message || 'Failed to load logs'
  } finally {
    loading.value = false
  }
}

async function loadStats() {
  try {
    const res = await fetchStats()
    stats.value = res.data
  } catch { /* non-critical */ }
}

function applyFilters() {
  appliedFilters.value = { ...filters.value }
  currentPage.value = 1
  loadLogs()
}

function resetFilters() {
  filters.value = defaultFilters()
  appliedFilters.value = defaultFilters()
  currentPage.value = 1
  loadLogs()
}

function goToPage(p: number) {
  currentPage.value = p
  loadLogs()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const topActions = computed(() => {
  if (!stats.value) return {}
  return Object.fromEntries(
    Object.entries(stats.value.actionStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3),
  )
})

const visiblePages = computed((): (number | string)[] => {
  const total = pagination.value?.totalPages ?? 1
  const cur = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | string)[] = [1]
  if (cur > 3) pages.push('...')
  for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++)
    pages.push(i)
  if (cur < total - 2) pages.push('...')
  pages.push(total)
  return pages
})

function formatTime(iso: string): string {
  const d = new Date(iso)
  return (
    d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' ' +
    d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  )
}

function actionClass(action: string): string {
  const map: Record<string, string> = {
    LOGIN: 'badge-auth', LOGOUT: 'badge-auth',
    START_TEST: 'badge-test', SUBMIT_TEST: 'badge-test',
    SAVE_ANSWER: 'badge-test', UPLOAD_AUDIO: 'badge-test',
    UPDATE_PROFILE: 'badge-user', DELETE_ACCOUNT: 'badge-danger',
    ACCESS_RESOURCE: 'badge-access', ADMIN_ACTION: 'badge-admin',
    ERROR: 'badge-fail',
  }
  return map[action] ?? 'badge-access'
}

onMounted(() => {
  loadLogs()
  loadStats()
})
</script>
