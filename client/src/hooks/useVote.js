/**
 * Hook לניהול הצבעה
 */

import { useState, useCallback } from 'react'
import { submitVote } from '../services/api'

export function useVote(onSuccess) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [nextSlot, setNextSlot] = useState(null)

  // פונקציית הצבעה
  const vote = useCallback(async (voteType) => {
    try {
      setLoading(true)
      setError(null)
      setMessage(null)

      const response = await submitVote(voteType)

      setMessage({
        type: 'success',
        text: response.message || 'ההצבעה נקלטה בהצלחה!',
      })

      // קריאה ל-callback עם הנתונים המעודכנים
      if (onSuccess && response.data) {
        onSuccess(response.data)
      }

      return response

    } catch (err) {
      const errorMessage = err.message || 'שגיאה בהצבעה'

      setError(errorMessage)
      setMessage({
        type: 'error',
        text: errorMessage,
      })

      // שמירת זמן התקופה הבאה אם קיים
      if (err.data?.next_slot) {
        setNextSlot(err.data.next_slot)
      }

      throw err

    } finally {
      setLoading(false)
    }
  }, [onSuccess])

  // פונקציית ניקוי הודעה
  const clearMessage = useCallback(() => {
    setMessage(null)
    setError(null)
  }, [])

  return {
    vote,
    loading,
    error,
    message,
    nextSlot,
    clearMessage,
  }
}

export default useVote
