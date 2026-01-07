/**
 * קומפוננטת פריט יחיד בהיסטוריה
 */

import { formatTimeRange, formatPercentage, formatNumber, formatResult } from '../utils/formatters'
import './HistoryItem.css'

function HistoryItem({ slot }) {
  const {
    slot_time,
    slot_end,
    has_mashak_votes,
    no_mashak_votes,
    total_votes,
    has_mashak_percentage,
    no_mashak_percentage,
    result,
    is_current,
  } = slot

  return (
    <div className={`history-item ${is_current ? 'current' : ''}`}>
      {/* Header */}
      <div className="history-item-header">
        <span className="history-time">
          {formatTimeRange(slot_time, slot_end)}
        </span>
        {is_current && <span className="badge current-badge">עכשיו</span>}
      </div>

      {/* Mini bar */}
      <div className="history-bar">
        {total_votes > 0 ? (
          <>
            <div
              className="history-bar-segment yes"
              style={{ width: `${has_mashak_percentage}%` }}
            />
            <div
              className="history-bar-segment no"
              style={{ width: `${no_mashak_percentage}%` }}
            />
          </>
        ) : (
          <div className="history-bar-empty" />
        )}
      </div>

      {/* Stats */}
      <div className="history-stats">
        <span className="stat yes">
          {formatPercentage(has_mashak_percentage)} ({formatNumber(has_mashak_votes)})
        </span>
        <span className="stat no">
          {formatPercentage(no_mashak_percentage)} ({formatNumber(no_mashak_votes)})
        </span>
      </div>

      {/* Result badge */}
      <div className="history-result">
        <span className={`badge result-badge ${result || 'none'}`}>
          {formatResult(result)}
        </span>
        <span className="total-votes">{formatNumber(total_votes)} הצבעות</span>
      </div>
    </div>
  )
}

export default HistoryItem
