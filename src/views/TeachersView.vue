<template>
  <div class="view">
    <div class="view-header">
      <div>
        <h2 class="view-title">Teachers</h2>
        <p class="view-sub">
          {{ teachers.length }} teacher{{ teachers.length !== 1 ? 's' : '' }} registered
        </p>
      </div>
      <button class="btn-primary" @click="showModal = true">+ Add Teacher</button>
    </div>

    <div v-if="loading" class="state-msg">Loading...</div>
    <div v-else-if="fetchError" class="state-msg error">{{ fetchError }}</div>
    <div v-else class="table-wrap" style="padding: 0">
      <table class="log-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Bio</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="teachers.length === 0">
            <td colspan="4" class="empty-row">No teachers yet. Add one above.</td>
          </tr>
          <tr v-for="t in teachers" :key="t._id">
            <td>
              <span class="teacher-name">{{ t.name }}{{ t.surName ? ' ' + t.surName : '' }}</span>
            </td>
            <td class="cell-email">{{ t.email }}</td>
            <td class="cell-desc">{{ t.bio || '—' }}</td>
            <td>
              <button class="btn-danger" @click="removeTeacher(t._id, t.name)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-card">
        <div class="modal-header">
          <h3>Add Teacher</h3>
          <button class="modal-close" @click="closeModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="field">
              <label>First Name *</label>
              <input v-model="form.name" placeholder="John" @keyup.enter="submitCreate" />
            </div>
            <div class="field">
              <label>Last Name</label>
              <input v-model="form.surName" placeholder="Doe" />
            </div>
          </div>
          <div class="field">
            <label>Email *</label>
            <input v-model="form.email" type="email" placeholder="john@example.com" />
          </div>
          <div class="field">
            <label>Password *</label>
            <input v-model="form.password" type="password" placeholder="min 6 characters" />
          </div>
          <div class="field">
            <label>Bio</label>
            <input v-model="form.bio" placeholder="optional" />
          </div>
          <p v-if="formError" class="error-msg">{{ formError }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn-ghost" @click="closeModal">Cancel</button>
          <button class="btn-primary" :disabled="submitting" @click="submitCreate">
            {{ submitting ? 'Creating...' : 'Create Teacher' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchTeachers, createTeacher, deleteTeacher } from '../api'
import type { Teacher } from '../types'

const teachers = ref<Teacher[]>([])
const loading = ref(true)
const fetchError = ref('')

const showModal = ref(false)
const submitting = ref(false)
const formError = ref('')
const form = ref({ name: '', surName: '', email: '', password: '', bio: '' })

async function load() {
  loading.value = true
  fetchError.value = ''
  try {
    const res = await fetchTeachers()
    teachers.value = res.data
  } catch (e: any) {
    fetchError.value = e?.response?.data?.message || 'Failed to load teachers'
  } finally {
    loading.value = false
  }
}

function closeModal() {
  showModal.value = false
  form.value = { name: '', surName: '', email: '', password: '', bio: '' }
  formError.value = ''
}

async function submitCreate() {
  if (!form.value.name.trim() || !form.value.email.trim() || !form.value.password.trim()) {
    formError.value = 'Name, email and password are required'
    return
  }
  submitting.value = true
  formError.value = ''
  try {
    const res = await createTeacher({
      name: form.value.name.trim(),
      surName: form.value.surName.trim() || undefined,
      email: form.value.email.trim(),
      password: form.value.password,
      bio: form.value.bio.trim() || undefined,
    })
    teachers.value.unshift(res.data)
    closeModal()
  } catch (e: any) {
    formError.value = e?.response?.data?.message || 'Failed to create teacher'
  } finally {
    submitting.value = false
  }
}

async function removeTeacher(id: string, name: string) {
  if (!confirm(`Delete teacher "${name}"? This cannot be undone.`)) return
  try {
    await deleteTeacher(id)
    teachers.value = teachers.value.filter((t) => t._id !== id)
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Failed to delete teacher')
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
.teacher-name {
  font-weight: 600;
  color: #1a1a2e;
}
.btn-danger {
  background: transparent;
  border: 1px solid #fca5a5;
  color: #dc2626;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-danger:hover {
  background: #fee2e2;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 16px;
}
.modal-card {
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e5e7eb;
}
.modal-header h3 {
  font-size: 17px;
  font-weight: 700;
  color: #1a1a2e;
}
.modal-close {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #9ca3af;
  padding: 4px;
  line-height: 1;
}
.modal-close:hover { color: #374151; }
.modal-body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.form-row {
  display: flex;
  gap: 12px;
}
.form-row .field { flex: 1; }
.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
