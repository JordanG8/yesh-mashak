/**
 * Hook לטעינת היסטוריה
 */

import { useState, useEffect, useCallback } from 'react'
import { getHistory } from '../services/api'

export function useHistory(hours = 24) {
  const [history, setHistory] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // פונקציית טעינת נתונים
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getHistory(hours)
      setHistory(response.data || [])
      setMeta(response.meta || null)
      setError(null)
    } catch (err) {
      setError(err.message || 'שגיאה בטעינת היסטוריה')
    } finally {
      setLoading(false)
    }
  }, [hours])

  // טעינה ראשונית
  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    history,
    meta,
    loading,
    error,
    refetch: fetchData,
  }
}

export default useHistory
