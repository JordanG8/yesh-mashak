/**
 * קומפוננטת הודעות למשתמש
 * מציגה הודעות הצלחה, שגיאה, או מידע
 */

import { useEffect } from 'react'
import './Message.css'

function Message({
  type = 'info', // 'success' | 'error' | 'warning' | 'info'
  message,
  onClose,
  autoClose = true,
  duration = 5000,
}) {
  // סגירה אוטומטית
  useEffect(() => {
    if (!autoClose || !onClose) return

    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [autoClose, duration, onClose])

  if (!message) return null

  return (
    <div className={`message message-${type}`} role="alert">
      <span className="message-icon">
        {type === 'success' && '✓'}
        {type === 'error' && '✗'}
        {type === 'warning' && '⚠'}
        {type === 'info' && 'ℹ'}
      </span>
      <span className="message-text">{message}</span>
      {onClose && (
        <button className="message-close" onClick={onClose} aria-label="סגור">
          ×
        </button>
      )}
    </div>
  )
}

export default Message
