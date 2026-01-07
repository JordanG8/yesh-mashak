/**
 * קומפוננטת סטטוס נוכחי
 * מציגה את זמן התקופה הנוכחית וספירה לאחור
 */

import { formatTimeRange, formatDateTime } from '../utils/formatters'
import { formatTimeRemaining } from '../utils/timeSlot'
import './CurrentStatus.css'

function CurrentStatus({
  slotTime,
  slotEnd,
  timeRemaining = 0,
}) {
  const timeRemainingFormatted = formatTimeRemaining(timeRemaining)

  return (
    <div className="current-status">
      <div className="status-time">
        <span className="time-label">תקופה נוכחית:</span>
        <span className="time-value">
          {formatTimeRange(slotTime, slotEnd)}
        </span>
      </div>

      <div className="status-countdown">
        <span className="countdown-label">זמן נותר:</span>
        <span className="countdown-value">{timeRemainingFormatted}</span>
      </div>
    </div>
  )
}

export default CurrentStatus
