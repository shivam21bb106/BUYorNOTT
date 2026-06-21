import { formatCompactNumber, formatMoney, numberValue } from '../../utils/numberFormat'

export function ResultCard({ result, onReset, onEdit, onShare }) {
  const { income, purchase, metrics, verdict } = result
  const monthlySavingsMessage =
    metrics.monthlySavings <= 0
      ? 'No savings room for this one yet.'
      : `About ${formatCompactNumber(metrics.weeksToSave)} weeks of saving gets you there.`

  return (
    <section className={`panel result-panel ${verdict.tone}`}>
      <div className="verdict-band">
        <p>{verdict.eyebrow}</p>
        <h2>{verdict.label}</h2>
        <span>{result.score}/100</span>
      </div>

      <div className="result-summary">
        <div>
          <p>{purchase.purchaseType}</p>
          <h3>{purchase.itemName || 'Unnamed purchase'}</h3>
        </div>
        <strong>{formatMoney(numberValue(purchase.cost), income.currency)}</strong>
      </div>

      <div className="metric-grid">
        <div>
          <span>Work time cost</span>
          <strong>
            {Number.isFinite(metrics.workHoursNeeded)
              ? `${formatCompactNumber(metrics.workHoursNeeded)} hours`
              : 'Unavailable'}
          </strong>
          <p>
            {Number.isFinite(metrics.workDaysNeeded)
              ? `${formatCompactNumber(metrics.workDaysNeeded)} work days`
              : 'Add real income and work hours'}
          </p>
        </div>
        <div>
          <span>Save-up time</span>
          <strong>
            {Number.isFinite(metrics.monthsToSave)
              ? `${formatCompactNumber(metrics.monthsToSave)} months`
              : 'No savings capacity'}
          </strong>
          <p>{monthlySavingsMessage}</p>
        </div>
        <div>
          <span>Cost each time</span>
          <strong>{formatMoney(metrics.costPerUse, income.currency)}</strong>
          <p>
            {purchase.purchaseType === 'Subscription'
              ? `${formatMoney(metrics.annualCost, income.currency)} annual cost`
              : `${formatCompactNumber(metrics.estimatedUses, 0)} estimated uses`}
          </p>
        </div>
      </div>

      <div className="recommendation">
        <span>Recommendation</span>
        <p>{result.recommendation}</p>
      </div>

      <div className="breakdown-list">
        {result.breakdown.map((item) => (
          <div className="breakdown-row" key={item.label}>
            <div>
              <span>{item.label}</span>
              <strong>
                {item.score}/{item.max}
              </strong>
            </div>
            <progress max={item.max} value={item.score} />
          </div>
        ))}
      </div>

      <div className="actions split wrap">
        <button className="secondary" onClick={onEdit} type="button">
          Edit answers
        </button>
        <button className="secondary" onClick={onReset} type="button">
          Calculate another
        </button>
        <button className="primary" onClick={onShare} type="button">
          Copy the verdict
        </button>
      </div>
    </section>
  )
}
