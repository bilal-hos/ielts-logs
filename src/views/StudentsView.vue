<template>
  <div class="view">
    <div class="view-header">
      <div>
        <h2 class="view-title">Students</h2>
        <p class="view-sub">
          {{ students.length }} student{{ students.length !== 1 ? 's' : '' }} registered
        </p>
      </div>
    </div>

    <div v-if="loading" class="state-msg">Loading...</div>
    <div v-else-if="fetchError" class="state-msg error">{{ fetchError }}</div>
    <div v-else class="table-wrap" style="padding: 0">
      <table class="log-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="students.length === 0">
            <td colspan="3" class="empty-row">No students yet.</td>
          </tr>
          <tr v-for="s in students" :key="s._id">
            <td>
              <span class="student-name">{{ s.name }}{{ s.surName ? ' ' + s.surName : '' }}</span>
            </td>
            <td class="cell-email">{{ s.email }}</td>
            <td>
              <span class="badge" style="background: #dbeafe; color: #1d4ed8">student</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchStudents } from '../api'
import type { Student } from '../types'

const students = ref<Student[]>([])
const loading = ref(true)
const fetchError = ref('')

onMounted(async () => {
  try {
    const res = await fetchStudents()
    students.value = res.data
  } catch (e: any) {
    fetchError.value = e?.response?.data?.message || 'Failed to load students'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.view {
  padding: 24px;
  max-width: 1100px;
  margin: 0 auto;
}
.view-header {
  margin-bottom: 20px;
}
.view-title {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a2e;
}
.view-sub {
  font-size: 13px;
  color: #6b7280;
  margin-top: 2px;
}
.student-name {
  font-weight: 600;
  color: #1a1a2e;
}
</style>
