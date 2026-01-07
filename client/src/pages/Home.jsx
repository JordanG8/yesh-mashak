/**
 * עמוד ראשי - הצבעה וסטטוס נוכחי
 */

import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import useCurrentStatus from '../hooks/useCurrentStatus'
import useVote from '../hooks/useVote'
import VoteBar from '../components/VoteBar'
import VoteButtons from '../components/VoteButtons'
import CurrentStatus from '../components/CurrentStatus'
import Message from '../components/Message'
import './Home.css'

function Home() {
  const { data, loading, error, timeRemaining, refetch } = useCurrentStatus()

  // Callback לעדכון לאחר הצבעה מוצלחת
  const handleVoteSuccess = useCallback(() => {
    refetch()
  }, [refetch])

  const {
    vote,
    loading: voteLoading,
    message,
    clearMessage,
  } = useVote(handleVoteSuccess)

  // הצבעה
  const handleVote = async (voteType) => {
    try {
      await vote(voteType)
    } catch (err) {
      // Error already handled by useVote hook
    }
  }

  // Loading state
  if (loading && !data) {
    return (
      <div className="home-page">
        <div className="container">
          <div className="loading-container">
            <div className="spinner" />
            <p>טוען נתונים...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !data) {
    return (
      <div className="home-page">
        <div className="container">
          <div className="error-container">
            <h2>שגיאה</h2>
            <p>{error}</p>
            <button onClick={refetch} className="retry-button">
              נסה שוב
            </button>
          </div>
        </div>
      </div>
    )
  }

  const hasVoted = data?.user_voted || false
  const userVote = data?.user_vote || null

  return (
    <div className="home-page">
      <div className="container">
        {/* Header */}
        <header className="home-header">
          <h1>יש משק?</h1>
          <p className="subtitle">דווח האם יש משמעת בכניסה לבסיס</p>
        </header>

        {/* Main card */}
        <main className="card main-card">
          {/* Current status */}
          <CurrentStatus
            slotTime={data?.slot_time}
            slotEnd={data?.slot_end}
            timeRemaining={timeRemaining}
          />

          {/* Vote bar */}
          <VoteBar
            hasPercentage={data?.has_mashak_percentage || 0}
            noPercentage={data?.no_mashak_percentage || 0}
            hasVotes={data?.has_mashak_votes || 0}
            noVotes={data?.no_mashak_votes || 0}
            size="large"
          />

          {/* Message */}
          {message && (
            <Message
              type={message.type}
              message={message.text}
              onClose={clearMessage}
            />
          )}

          {/* Vote buttons */}
          <VoteButtons
            onVote={handleVote}
            disabled={hasVoted}
            userVote={userVote}
            loading={voteLoading}
          />
        </main>

        {/* History link */}
        <nav className="home-nav">
          <Link to="/history" className="history-link">
            צפה בהיסטוריה
          </Link>
        </nav>

        {/* Footer */}
        <footer className="home-footer">
          <p>התקופה מתחלפת כל 10 דקות</p>
          <p>ניתן להצביע פעם אחת בכל תקופה</p>
        </footer>
      </div>
    </div>
  )
}

export default Home
