/**
 * קומפוננטת כפתורי הצבעה
 */

import './VoteButtons.css'

function VoteButtons({
  onVote,
  disabled = false,
  userVote = null,
  loading = false,
}) {
  const handleVote = (voteType) => {
    if (!disabled && !loading && onVote) {
      onVote(voteType)
    }
  }

  const isYesSelected = userVote === 'yes'
  const isNoSelected = userVote === 'no'

  return (
    <div className="vote-buttons">
      <button
        className={`vote-button yes ${isYesSelected ? 'selected' : ''}`}
        onClick={() => handleVote('yes')}
        disabled={disabled || loading}
        aria-label="הצבע יש משק"
      >
        {loading ? (
          <span className="button-spinner" />
        ) : (
          <>
            <span className="button-icon">✓</span>
            <span className="button-text">יש משק</span>
          </>
        )}
      </button>

      <button
        className={`vote-button no ${isNoSelected ? 'selected' : ''}`}
        onClick={() => handleVote('no')}
        disabled={disabled || loading}
        aria-label="הצבע אין משק"
      >
        {loading ? (
          <span className="button-spinner" />
        ) : (
          <>
            <span className="button-icon">✗</span>
            <span className="button-text">אין משק</span>
          </>
        )}
      </button>

      {disabled && userVote && (
        <p className="vote-message">
          הצבעת <strong>{userVote === 'yes' ? 'יש משק' : 'אין משק'}</strong>
        </p>
      )}
    </div>
  )
}

export default VoteButtons
