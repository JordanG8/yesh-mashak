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
import SecurityIcon from '@mui/icons-material/Security'
import HistoryIcon from '@mui/icons-material/History'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import HowToVoteIcon from '@mui/icons-material/HowToVote'
import GroupIcon from '@mui/icons-material/Group'
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
        {/* Hero Section */}
        <header className="home-header" role="banner">
          <div className="hero-badge" aria-hidden="true">
            <SecurityIcon className="badge-icon" />
          </div>
          <h1 className="main-title">דיווח על מש"ק משמעת</h1>
          <p className="subtitle-large">דווח בזמן אמת האם יש מש"ק משמעת בכניסה לבסיס</p>
          <div className="info-box">
            <p className="info-text">
              <strong>מה זה?</strong> אפליקציה לדיווח קהילתי על נוכחות מש"ק משמעת בכניסה לבסיס.
              <br />
              הצבע עכשיו ועזור לחבריך לדעת מה מצפה להם!
            </p>
          </div>
        </header>

        {/* Main card */}
        <main className="card main-card" role="main" aria-label="אזור הצבעה ראשי">
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
        <nav className="home-nav" role="navigation" aria-label="ניווט משני">
          <Link to="/history" className="history-link" aria-label="עבור לעמוד היסטוריה">
            <HistoryIcon className="nav-icon" />
            <span>צפה בהיסטוריה מלאה</span>
          </Link>
        </nav>

        {/* Footer */}
        <footer className="home-footer" role="contentinfo">
          <div className="footer-rules">
            <h3 className="footer-title">כללי השימוש:</h3>
            <ul className="footer-list">
              <li>
                <AccessTimeIcon className="footer-icon" />
                <span>התקופה מתחלפת כל 10 דקות</span>
              </li>
              <li>
                <HowToVoteIcon className="footer-icon" />
                <span>ניתן להצביע פעם אחת בכל תקופה</span>
              </li>
              <li>
                <GroupIcon className="footer-icon" />
                <span>הדיווחים אנונימיים ומשותפים לכלל המשתמשים</span>
              </li>
            </ul>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default Home
