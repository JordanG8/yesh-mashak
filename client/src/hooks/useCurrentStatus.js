/**
 * Hook לקבלת סטטוס נוכחי עם polling אוטומטי
 */

import { useState, useEffect, useCallback } from 'react'
import { getCurrentStatus } from '../services/api'
import { calculateTimeRemaining, isSlotExpired } from '../utils/timeSlot'

const POLL_INTERVAL = 30000 // 30 שניות

export function useCurrentStatus() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeRemaining, setTimeRemaining] = useState(0)

  // פונקציית טעינת נתונים
  const fetchData = useCallback(async () => {
    try {
      const response = await getCurrentStatus()
      setData(response.data)
      setTimeRemaining(response.data.time_remaining_seconds || 0)
      setError(null)
    } catch (err) {
      setError(err.message || 'שגיאה בטעינת נתונים')
    } finally {
      setLoading(false)
    }
  }, [])

  // טעינה ראשונית ו-polling
  useEffect(() => {
    fetchData()

    // polling כל 30 שניות
    const pollInterval = setInterval(fetchData, POLL_INTERVAL)

    return () => clearInterval(pollInterval)
  }, [fetchData])

  // עדכון countdown כל שנייה
  useEffect(() => {
    if (!data?.slot_end) return

    const countdownInterval = setInterval(() => {
      const remaining = calculateTimeRemaining(data.slot_end)
      setTimeRemaining(remaining)

      // אם התקופה נגמרה, טען מחדש
      if (remaining === 0) {
        fetchData()
      }
    }, 1000)

    return () => clearInterval(countdownInterval)
  }, [data?.slot_end, fetchData])

  return {
    data,
    loading,
    error,
    timeRemaining,
    refetch: fetchData,
  }
}

export default useCurrentStatus
