/**
 * קומפוננטת רשימת היסטוריה
 */

import HistoryItem from './HistoryItem'
import './HistoryList.css'

function HistoryList({ history }) {
  if (!history || history.length === 0) {
    return (
      <div className="history-empty">
        <p>אין נתוני היסטוריה זמינים</p>
      </div>
    )
  }

  return (
    <div className="history-list">
      {history.map((slot, index) => (
        <HistoryItem key={slot.slot_time || index} slot={slot} />
      ))}
    </div>
  )
}

export default HistoryList
