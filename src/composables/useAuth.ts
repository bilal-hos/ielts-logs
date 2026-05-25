import { ref } from 'vue'
import type { Ref } from 'vue'
import { getStoredUser, getToken, clearAuth } from '../api'

interface AuthUser {
  id?: string
  name: string
  email: string
  role: string
}

const user: Ref<AuthUser | null> = ref(null)

const stored = getStoredUser()
if (stored && getToken()) {
  user.value = stored
}

export function useAuth() {
  function logout() {
    clearAuth()
    user.value = null
  }
  return { user, logout }
}
