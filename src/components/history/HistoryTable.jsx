import { formatMoney, numberValue } from '../../utils/numberFormat'

export function HistoryTable({ history, onClear, onDelete, onEdit }) {
  if (history.length === 0) {
    return (
      <section className="panel history-panel empty-history" id="history">
        <div>
          <p className="eyebrow">Local history</p>
          <h2>No decisions saved yet</h2>
          <p>Your past money debates will show up here on this device.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="panel history-panel" id="history">
      <div className="history-heading">
        <div>
          <p className="eyebrow">Local history</p>
          <h2>Past money debates</h2>
        </div>
        <button className="secondary" onClick={onClear} type="button">
          Clear history
        </button>
      </div>

      <div className="history-list">
        {history.map((item) => (
          <article className="history-item" key={item.id}>
            <div>
              <span>{item.purchase.purchaseType}</span>
              <strong>{item.purchase.itemName || 'Unnamed purchase'}</strong>
            </div>
            <div>
              <span>Cost</span>
              <strong>
                {formatMoney(numberValue(item.purchase.cost), item.income.currency)}
              </strong>
            </div>
            <div>
              <span>Score</span>
              <strong>{item.score}/100</strong>
            </div>
            <div>
              <span>Verdict</span>
              <strong className={`history-verdict ${item.verdict.tone}`}>
                {item.verdict.label}
              </strong>
            </div>
            <div className="history-actions">
              <button className="secondary small" onClick={() => onEdit(item)}>
                Edit
              </button>
              <button className="ghost small" onClick={() => onDelete(item.id)}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
