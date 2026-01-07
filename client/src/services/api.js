/**
 * שירות API - תקשורת עם השרת
 * משתמש ב-Axios לביצוע בקשות HTTP
 */

import axios from 'axios'

// יצירת instance של Axios עם הגדרות בסיסיות
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor לטיפול בתגובות
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // חילוץ הודעת שגיאה מהתגובה
    const message = error.response?.data?.message || 'שגיאה בתקשורת עם השרת'
    const code = error.response?.data?.code || 'NETWORK_ERROR'
    const data = error.response?.data?.data || null

    return Promise.reject({
      message,
      code,
      data,
      status: error.response?.status,
    })
  }
)

/**
 * שליחת הצבעה
 * @param {'yes'|'no'} vote - סוג ההצבעה
 * @returns {Promise<Object>}
 */
export async function submitVote(vote) {
  return api.post('/vote', { vote })
}

/**
 * קבלת סטטוס נוכחי
 * @returns {Promise<Object>}
 */
export async function getCurrentStatus() {
  return api.get('/current')
}

/**
 * קבלת היסטוריה
 * @param {number} hours - מספר שעות (ברירת מחדל: 24)
 * @returns {Promise<Object>}
 */
export async function getHistory(hours = 24) {
  return api.get('/history', { params: { hours } })
}

/**
 * בדיקת בריאות השרת
 * @returns {Promise<Object>}
 */
export async function healthCheck() {
  return api.get('/health')
}

export default {
  submitVote,
  getCurrentStatus,
  getHistory,
  healthCheck,
}
