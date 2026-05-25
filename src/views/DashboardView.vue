<template>
  <div class="view">
    <div class="view-header">
      <h2 class="view-title">Dashboard</h2>
      <button class="btn-ghost btn-sm" @click="load" :disabled="loading">
        {{ loading ? 'Refreshing...' : '↻ Refresh' }}
      </button>
    </div>

    <div v-if="loading && !data" class="state-msg">Loading...</div>
    <div v-else-if="error" class="state-msg error">{{ error }}</div>

    <template v-else-if="data">

      <!-- ── Users ── -->
      <section class="section">
        <h3 class="section-title">Users</h3>
        <div class="cards-row">
          <div class="dash-card blue">
            <span class="dash-num">{{ data.users.students }}</span>
            <span class="dash-label">Students</span>
          </div>
          <div class="dash-card green">
            <span class="dash-num">{{ data.users.teachers }}</span>
            <span class="dash-label">Teachers</span>
          </div>
          <div class="dash-card yellow">
            <span class="dash-num">{{ data.users.admins }}</span>
            <span class="dash-label">Admins</span>
          </div>
          <div class="dash-card">
            <span class="dash-num">{{ data.users.total }}</span>
            <span class="dash-label">Total Users</span>
          </div>
        </div>
      </section>

      <!-- ── Tests ── -->
      <section class="section">
        <h3 class="section-title">Tests Generated</h3>
        <div class="cards-row">
          <div class="dash-card">
            <span class="dash-num">{{ data.tests.total }}</span>
            <span class="dash-label">Total</span>
          </div>
          <div class="dash-card module-reading">
            <span class="dash-num">{{ data.tests.reading }}</span>
            <span class="dash-label">Reading</span>
          </div>
          <div class="dash-card module-listening">
            <span class="dash-num">{{ data.tests.listening }}</span>
            <span class="dash-label">Listening</span>
          </div>
          <div class="dash-card module-writing">
            <span class="dash-num">{{ data.tests.writing }}</span>
            <span class="dash-label">Writing</span>
          </div>
          <div class="dash-card module-speaking">
            <span class="dash-num">{{ data.tests.speaking }}</span>
            <span class="dash-label">Speaking</span>
          </div>
        </div>
      </section>

      <!-- ── Attempts ── -->
      <section class="section">
        <h3 class="section-title">Attempts</h3>
        <div class="cards-row" style="margin-bottom: 16px">
          <div class="dash-card">
            <span class="dash-num">{{ data.attempts.total }}</span>
            <span class="dash-label">Total</span>
          </div>
          <div class="dash-card green">
            <span class="dash-num">{{ data.attempts.submitted }}</span>
            <span class="dash-label">Submitted</span>
          </div>
          <div class="dash-card yellow">
            <span class="dash-num">{{ data.attempts.inProgress }}</span>
            <span class="dash-label">In Progress</span>
          </div>
        </div>

        <!-- Per-module breakdown table -->
        <div class="table-wrap" style="padding: 0">
          <table class="log-table">
            <thead>
              <tr>
                <th>Module</th>
                <th>Total</th>
                <th>Submitted</th>
                <th>In Progress</th>
                <th>Avg Score</th>
                <th>Passed (≥5)</th>
                <th>Pass Rate</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="data.attempts.byType.length === 0">
                <td colspan="7" class="empty-row">No attempts yet.</td>
              </tr>
              <tr v-for="row in sortedAttempts" :key="row._id">
                <td>
                  <span class="module-badge" :class="'mod-' + row._id">
                    {{ row._id }}
                  </span>
                </td>
                <td><strong>{{ row.total }}</strong></td>
                <td>{{ row.submitted }}</td>
                <td>{{ row.inProgress }}</td>
                <td>
                  <span v-if="row.avgScore !== null">
                    {{ row.avgScore.toFixed(1) }}
                  </span>
                  <span v-else class="muted">—</span>
                </td>
                <td>
                  <span v-if="row.avgScore !== null">{{ row.passed }}</span>
                  <span v-else class="muted">—</span>
                </td>
                <td>
                  <span v-if="row.avgScore !== null && row.submitted > 0">
                    <span class="pass-rate" :class="passRateClass(row.passed / row.submitted)">
                      {{ Math.round((row.passed / row.submitted) * 100) }}%
                    </span>
                  </span>
                  <span v-else class="muted">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ── Writing & Speaking ── -->
      <div class="two-col">

        <!-- Writing -->
        <section class="section">
          <h3 class="section-title">Writing Submissions</h3>
          <div class="cards-row" style="margin-bottom: 12px">
            <div class="dash-card">
              <span class="dash-num">{{ data.writing.total }}</span>
              <span class="dash-label">Total</span>
            </div>
            <div class="dash-card blue">
              <span class="dash-num">
                {{ data.writing.avgAiBand !== null ? data.writing.avgAiBand.toFixed(1) : '—' }}
              </span>
              <span class="dash-label">Avg AI Band</span>
            </div>
          </div>
          <div class="status-list">
            <div class="status-row">
              <span class="status-dot dot-grey"></span>
              <span class="status-label">Pending AI</span>
              <span class="status-count">{{ data.writing.pendingAi }}</span>
            </div>
            <div class="status-row">
              <span class="status-dot dot-blue"></span>
              <span class="status-label">AI Scored</span>
              <span class="status-count">{{ data.writing.aiScored }}</span>
            </div>
            <div class="status-row warn" v-if="data.writing.pendingTeacher > 0">
              <span class="status-dot dot-orange"></span>
              <span class="status-label">Pending Teacher Review</span>
              <span class="status-count badge-warn">{{ data.writing.pendingTeacher }}</span>
            </div>
            <div class="status-row" v-else>
              <span class="status-dot dot-orange"></span>
              <span class="status-label">Pending Teacher Review</span>
              <span class="status-count">0</span>
            </div>
            <div class="status-row">
              <span class="status-dot dot-green"></span>
              <span class="status-label">Teacher Reviewed</span>
              <span class="status-count">{{ data.writing.teacherReviewed }}</span>
            </div>
          </div>
        </section>

        <!-- Speaking -->
        <section class="section">
          <h3 class="section-title">Speaking Submissions</h3>
          <div class="cards-row" style="margin-bottom: 12px">
            <div class="dash-card">
              <span class="dash-num">{{ data.speaking.total }}</span>
              <span class="dash-label">Total</span>
            </div>
          </div>
          <div class="status-list">
            <div class="status-row warn" v-if="data.speaking.pendingTeacher > 0">
              <span class="status-dot dot-orange"></span>
              <span class="status-label">Pending Teacher</span>
              <span class="status-count badge-warn">{{ data.speaking.pendingTeacher }}</span>
            </div>
            <div class="status-row" v-else>
              <span class="status-dot dot-orange"></span>
              <span class="status-label">Pending Teacher</span>
              <span class="status-count">0</span>
            </div>
            <div class="status-row">
              <span class="status-dot dot-blue"></span>
              <span class="status-label">Under Review</span>
              <span class="status-count">{{ data.speaking.underReview }}</span>
            </div>
            <div class="status-row">
              <span class="status-dot dot-green"></span>
              <span class="status-label">Teacher Reviewed</span>
              <span class="status-count">{{ data.speaking.teacherReviewed }}</span>
            </div>
          </div>
        </section>
      </div>

    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { fetchDashboardStats } from '../api'
import type { DashboardStats } from '../types'

const data = ref<DashboardStats | null>(null)
const loading = ref(false)
const error = ref('')

const MODULE_ORDER = ['reading', 'listening', 'writing', 'speaking']

const sortedAttempts = computed(() =>
  [...(data.value?.attempts.byType ?? [])].sort(
    (a, b) => MODULE_ORDER.indexOf(a._id) - MODULE_ORDER.indexOf(b._id),
  ),
)

function passRateClass(rate: number) {
  if (rate >= 0.7) return 'rate-good'
  if (rate >= 0.5) return 'rate-mid'
  return 'rate-bad'
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const res = await fetchDashboardStats()
    data.value = res.data
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Failed to load dashboard'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.view {
  padding: 24px;
  max-width: 1100px;
  margin: 0 auto;
}
.view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}
.view-title {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a2e;
}
.btn-sm { padding: 5px 12px; font-size: 12px; }

.section { margin-bottom: 32px; }
.section-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  color: #6b7280;
  margin-bottom: 12px;
}

.cards-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.dash-card {
  flex: 1 1 90px;
  min-width: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 12px;
  border-radius: 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
.dash-card.blue   { border-color: #93c5fd; background: #eff6ff; }
.dash-card.green  { border-color: #86efac; background: #f0fdf4; }
.dash-card.yellow { border-color: #fde68a; background: #fffbeb; }
.dash-card.red    { border-color: #fca5a5; background: #fef2f2; }

.dash-card.module-reading   { border-color: #6366f1; background: #eef2ff; }
.dash-card.module-listening { border-color: #0ea5e9; background: #f0f9ff; }
.dash-card.module-writing   { border-color: #10b981; background: #ecfdf5; }
.dash-card.module-speaking  { border-color: #f59e0b; background: #fffbeb; }

.dash-num {
  font-size: 26px;
  font-weight: 700;
  color: #1a1a2e;
  line-height: 1;
}
.dash-label {
  font-size: 11px;
  color: #6b7280;
  margin-top: 5px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: center;
}

/* Module badge in table */
.module-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  text-transform: capitalize;
}
.mod-reading   { background: #eef2ff; color: #4338ca; }
.mod-listening { background: #f0f9ff; color: #0369a1; }
.mod-writing   { background: #ecfdf5; color: #065f46; }
.mod-speaking  { background: #fffbeb; color: #92400e; }

/* Pass rate */
.pass-rate {
  font-weight: 700;
  font-size: 13px;
}
.rate-good { color: #16a34a; }
.rate-mid  { color: #d97706; }
.rate-bad  { color: #dc2626; }

/* Two-column layout for writing + speaking */
.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}
@media (max-width: 700px) {
  .two-col { grid-template-columns: 1fr; }
}

/* Status list */
.status-list {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
}
.status-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 16px;
  border-bottom: 1px solid #f3f4f6;
}
.status-row:last-child { border-bottom: none; }
.status-row.warn { background: #fffbeb; }

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot-grey   { background: #9ca3af; }
.dot-blue   { background: #3b82f6; }
.dot-orange { background: #f59e0b; }
.dot-green  { background: #10b981; }

.status-label {
  flex: 1;
  font-size: 13px;
  color: #374151;
}
.status-count {
  font-weight: 700;
  font-size: 14px;
  color: #1a1a2e;
}
.badge-warn {
  background: #fef3c7;
  color: #92400e;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 12px;
}
</style>
