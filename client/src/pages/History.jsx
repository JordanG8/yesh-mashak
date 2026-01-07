/**
 * עמוד היסטוריה - תצוגת כל התקופות
 */

import { Link } from 'react-router-dom'
import useHistory from '../hooks/useHistory'
import HistoryList from '../components/HistoryList'
import { formatNumber } from '../utils/formatters'
import './History.css'

function History() {
  const { history, meta, loading, error, refetch } = useHistory(24)

  return (
    <div className="history-page">
      <div className="container">
        {/* Header */}
        <header className="history-header">
          <Link to="/" className="back-link">
            &rarr; חזרה
          </Link>
          <h1>היסטוריה</h1>
          <p className="subtitle">24 השעות האחרונות</p>
        </header>

        {/* Stats */}
        {meta && (
          <div className="history-stats-bar">
            <span>{formatNumber(meta.total_slots)} תקופות</span>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="loading-container">
            <div className="spinner" />
            <p>טוען היסטוריה...</p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="error-container">
            <p>{error}</p>
            <button onClick={refetch} className="retry-button">
              נסה שוב
            </button>
          </div>
        )}

        {/* History list */}
        {!loading && !error && (
          <HistoryList history={history} />
        )}

        {/* Back button */}
        <nav className="history-nav">
          <Link to="/" className="back-button">
            חזרה לעמוד הראשי
          </Link>
        </nav>
      </div>
    </div>
  )
}

export default History
