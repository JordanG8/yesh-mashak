/**
 * קומפוננטת בר אחוזים
 * מציגה את יחס ההצבעות בצורה ויזואלית
 */

import { formatPercentage, formatNumber } from '../utils/formatters'
import './VoteBar.css'

function VoteBar({
  hasPercentage = 0,
  noPercentage = 0,
  hasVotes = 0,
  noVotes = 0,
  showLabels = true,
  size = 'normal', // 'small' | 'normal' | 'large'
}) {
  const totalVotes = hasVotes + noVotes
  const hasNoVotes = totalVotes === 0

  return (
    <div className={`vote-bar-container vote-bar-${size}`}>
      {/* Labels */}
      {showLabels && (
        <div className="vote-bar-labels">
          <span className="vote-bar-label yes">
            <span className="percentage">{formatPercentage(hasPercentage)}</span>
            <span className="label-text">יש משק</span>
            <span className="votes-count">({formatNumber(hasVotes)})</span>
          </span>
          <span className="vote-bar-label no">
            <span className="percentage">{formatPercentage(noPercentage)}</span>
            <span className="label-text">אין משק</span>
            <span className="votes-count">({formatNumber(noVotes)})</span>
          </span>
        </div>
      )}

      {/* Bar */}
      <div className="vote-bar">
        {hasNoVotes ? (
          <div className="vote-bar-empty">עדיין אין הצבעות</div>
        ) : (
          <>
            <div
              className="vote-bar-segment yes"
              style={{ width: `${hasPercentage}%` }}
              title={`יש משק: ${formatPercentage(hasPercentage)}`}
            />
            <div
              className="vote-bar-segment no"
              style={{ width: `${noPercentage}%` }}
              title={`אין משק: ${formatPercentage(noPercentage)}`}
            />
          </>
        )}
      </div>

      {/* Total votes */}
      {showLabels && (
        <div className="vote-bar-total">
          סה"כ: {formatNumber(totalVotes)} הצבעות
        </div>
      )}
    </div>
  )
}

export default VoteBar
