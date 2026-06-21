import { useEffect, useMemo, useState } from 'react'
import './App.css'

const HISTORY_KEY = 'buy-it-or-not-history-v1'

const currencyOptions = [
  { code: 'USD', symbol: '$' },
  { code: 'INR', symbol: '₹' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'JPY', symbol: '¥' },
]

const usageOptions = [
  { value: 'rarely', label: 'Rarely' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'daily', label: 'Daily' },
]

const purchaseTypes = ['Product', 'Experience', 'Subscription']

const initialIncome = {
  currency: 'USD',
  monthlyIncome: 5000,
  savingsPercentage: 20,
  workHoursPerDay: 8,
  workDaysPerWeek: 5,
}

const initialPurchase = {
  itemName: '',
  cost: 500,
  purchaseType: 'Product',
  needScore: 3,
  wantScore: 4,
  expectedLifespan: 24,
  usageFrequency: 'weekly',
  urgency: 'Soon',
  alternativeChecked: 'Yes',
  regretRisk: 'Medium',
}

function numberValue(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function formatCompactNumber(value, maximumFractionDigits = 1) {
  if (!Number.isFinite(value)) {
    return '0'
  }

  return new Intl.NumberFormat('en', {
    maximumFractionDigits,
  }).format(value)
}

function formatMoney(value, currencyCode) {
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: value >= 100 ? 0 : 2,
  }).format(Number.isFinite(value) ? value : 0)
}

function getMonthlySavings(income) {
  return (
    numberValue(income.monthlyIncome) *
    (numberValue(income.savingsPercentage) / 100)
  )
}

function getHourlyValue(income) {
  const monthlyWorkHours =
    numberValue(income.workHoursPerDay) *
    numberValue(income.workDaysPerWeek) *
    4.33

  if (monthlyWorkHours <= 0) {
    return 0
  }

  return numberValue(income.monthlyIncome) / monthlyWorkHours
}

function scoreAffordability(cost, monthlySavings) {
  if (monthlySavings <= 0 || cost <= 0) {
    return monthlySavings <= 0 ? 0 : 25
  }

  const ratio = cost / monthlySavings

  if (ratio <= 0.25) return 25
  if (ratio <= 0.5) return 22
  if (ratio <= 1) return 18
  if (ratio <= 2) return 12
  if (ratio <= 3) return 7
  return 2
}

function scoreTimeToSave(weeksToSave, monthlySavings, cost) {
  if (cost <= 0) {
    return 20
  }

  if (monthlySavings <= 0 || !Number.isFinite(weeksToSave)) {
    return 0
  }

  if (weeksToSave <= 1) return 20
  if (weeksToSave <= 2) return 17
  if (weeksToSave <= 4.33) return 14
  if (weeksToSave <= 13) return 8
  if (weeksToSave <= 26) return 4
  return 1
}

function scoreValueOverTime(purchase) {
  if (purchase.purchaseType === 'Experience') {
    const experienceMap = {
      daily: 20,
      weekly: 16,
      monthly: 10,
      rarely: 4,
    }

    return experienceMap[purchase.usageFrequency] ?? 10
  }

  const lifespanMonths = Math.max(numberValue(purchase.expectedLifespan), 0)
  const usageScores = {
    daily: lifespanMonths >= 12 ? 20 : 17,
    weekly: lifespanMonths >= 12 ? 16 : 13,
    monthly: 10,
    rarely: 5,
  }

  if (lifespanMonths <= 1 && purchase.usageFrequency === 'rarely') {
    return 2
  }

  return usageScores[purchase.usageFrequency] ?? 10
}

function scoreRegretProtection(purchase) {
  const lowRegret =
    purchase.regretRisk === 'Low' &&
    purchase.alternativeChecked === 'Yes' &&
    purchase.urgency !== 'Need now'

  const highRegretImpulse =
    purchase.regretRisk === 'High' &&
    purchase.alternativeChecked === 'No' &&
    purchase.urgency === 'Need now'

  if (lowRegret) return 10
  if (highRegretImpulse) return 0
  return 5
}

function getEstimatedUses(purchase) {
  const lifespanMonths = Math.max(numberValue(purchase.expectedLifespan), 1)

  if (purchase.purchaseType === 'Subscription') {
    const monthlyUses = {
      daily: 30,
      weekly: 4,
      monthly: 1,
      rarely: 0.33,
    }

    return monthlyUses[purchase.usageFrequency] ?? 1
  }

  const lifespanDays = lifespanMonths * 30.44
  const lifespanWeeks = lifespanDays / 7

  const estimatedUses = {
    daily: lifespanDays,
    weekly: lifespanWeeks,
    monthly: lifespanMonths,
    rarely: lifespanMonths / 3,
  }

  return Math.max(estimatedUses[purchase.usageFrequency] ?? lifespanMonths, 1)
}

function getVerdict(score) {
  if (score >= 85) {
    return {
      label: 'Buy it',
      tone: 'excellent',
      eyebrow: 'Strong value',
    }
  }

  if (score >= 70) {
    return {
      label: 'Worth it, but check timing',
      tone: 'good',
      eyebrow: 'Looks reasonable',
    }
  }

  if (score >= 55) {
    return {
      label: 'Wait',
      tone: 'warning',
      eyebrow: 'Give it time',
    }
  }

  if (score >= 40) {
    return {
      label: 'Think harder',
      tone: 'caution',
      eyebrow: 'Mixed signal',
    }
  }

  return {
    label: 'Skip it',
    tone: 'danger',
    eyebrow: 'Weak value',
  }
}

function buildRecommendation({ metrics, score, verdict }) {
  if (metrics.monthlySavings <= 0) {
    return 'You currently have no monthly savings capacity for this purchase. Fix the savings gap first, then run the decision again.'
  }

  if (score >= 85) {
    return `This looks worth buying because it fits your savings capacity, has strong personal value, and the regret risk is controlled.`
  }

  if (score >= 70) {
    return `This is a reasonable purchase, but the timing still matters. If you can buy it without touching emergency money, it passes the test.`
  }

  if (score >= 55) {
    return `Wait 30 days before buying. The desire is real, but the money or long-term value does not fully support an immediate yes.`
  }

  if (verdict.label === 'Think harder') {
    return `The numbers are not clearly against it, but they are not clearly for it either. Compare alternatives and lower the cost before deciding.`
  }

  return `Skip it for now. The purchase takes too much savings time compared with the need, usage, and regret protection signals.`
}

function calculateResult(income, purchase) {
  const cost = Math.max(numberValue(purchase.cost), 0)
  const monthlySavings = getMonthlySavings(income)
  const hourlyValue = getHourlyValue(income)
  const workHoursNeeded = hourlyValue > 0 ? cost / hourlyValue : Infinity
  const workDaysNeeded =
    numberValue(income.workHoursPerDay) > 0
      ? workHoursNeeded / numberValue(income.workHoursPerDay)
      : Infinity
  const weeksToSave =
    monthlySavings > 0 ? cost / (monthlySavings / 4.33) : Infinity
  const monthsToSave = monthlySavings > 0 ? cost / monthlySavings : Infinity
  const estimatedUses = getEstimatedUses(purchase)
  const costPerUse = cost / estimatedUses
  const annualCost =
    purchase.purchaseType === 'Subscription' ? cost * 12 : undefined

  const affordabilityScore = scoreAffordability(cost, monthlySavings)
  const timeToSaveScore = scoreTimeToSave(weeksToSave, monthlySavings, cost)
  const needScoreWeighted = clamp(numberValue(purchase.needScore), 1, 5) * 3
  const wantScoreWeighted = clamp(numberValue(purchase.wantScore), 1, 5) * 2
  const valueOverTimeScore = scoreValueOverTime(purchase)
  const regretProtectionScore = scoreRegretProtection(purchase)

  const totalScore = Math.round(
    affordabilityScore +
      timeToSaveScore +
      needScoreWeighted +
      wantScoreWeighted +
      valueOverTimeScore +
      regretProtectionScore,
  )
  const verdict = getVerdict(totalScore)
  const metrics = {
    monthlySavings,
    hourlyValue,
    workHoursNeeded,
    workDaysNeeded,
    weeksToSave,
    monthsToSave,
    estimatedUses,
    costPerUse,
    annualCost,
  }

  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    income,
    purchase,
    score: totalScore,
    verdict,
    metrics,
    breakdown: [
      {
        label: 'Affordability',
        score: affordabilityScore,
        max: 25,
      },
      {
        label: 'Time to save',
        score: timeToSaveScore,
        max: 20,
      },
      {
        label: 'Need',
        score: needScoreWeighted,
        max: 15,
      },
      {
        label: 'Want',
        score: wantScoreWeighted,
        max: 10,
      },
      {
        label: 'Long-term value',
        score: valueOverTimeScore,
        max: 20,
      },
      {
        label: 'Regret risk',
        score: regretProtectionScore,
        max: 10,
      },
    ],
    recommendation: buildRecommendation({ metrics, score: totalScore, verdict }),
  }
}

function loadHistory() {
  try {
    const rawHistory = localStorage.getItem(HISTORY_KEY)
    return rawHistory ? JSON.parse(rawHistory) : []
  } catch {
    return []
  }
}

function StepIndicator({ activeStep }) {
  const steps = ['Income', 'Purchase', 'Result']

  return (
    <div className="stepper" aria-label="Progress">
      {steps.map((step, index) => (
        <div
          className={`step ${activeStep === index + 1 ? 'active' : ''} ${
            activeStep > index + 1 ? 'complete' : ''
          }`}
          key={step}
        >
          <span>{index + 1}</span>
          {step}
        </div>
      ))}
    </div>
  )
}

function NumberField({ label, value, onChange, min = 0, suffix }) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="input-wrap">
        <input
          min={min}
          onChange={(event) => onChange(event.target.value)}
          type="number"
          value={value}
        />
        {suffix ? <small>{suffix}</small> : null}
      </div>
    </label>
  )
}

function ChoiceGroup({ label, options, value, onChange }) {
  return (
    <div className="field">
      <span>{label}</span>
      <div className="choice-grid">
        {options.map((option) => {
          const optionValue = typeof option === 'string' ? option : option.value
          const optionLabel = typeof option === 'string' ? option : option.label

          return (
            <button
              className={value === optionValue ? 'choice selected' : 'choice'}
              key={optionValue}
              onClick={() => onChange(optionValue)}
              type="button"
            >
              {optionLabel}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function RatingGroup({ label, value, onChange, captions }) {
  return (
    <div className="field">
      <span>{label}</span>
      <div className="rating-grid">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            className={Number(value) === rating ? 'rating selected' : 'rating'}
            key={rating}
            onClick={() => onChange(rating)}
            type="button"
          >
            <strong>{rating}</strong>
            <small>{captions[rating - 1]}</small>
          </button>
        ))}
      </div>
    </div>
  )
}

function IncomeStep({ income, setIncome, onNext }) {
  const monthlySavings = getMonthlySavings(income)
  const hourlyValue = getHourlyValue(income)

  return (
    <section className="panel form-panel">
      <div className="panel-heading">
        <p className="eyebrow">Step 1</p>
        <h2>Income details</h2>
        <p>
          Start with your real earning and saving rhythm. This lets the app
          translate price into time.
        </p>
      </div>

      <div className="form-grid two-col">
        <label className="field">
          <span>Currency</span>
          <select
            onChange={(event) =>
              setIncome((current) => ({
                ...current,
                currency: event.target.value,
              }))
            }
            value={income.currency}
          >
            {currencyOptions.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.code} {currency.symbol}
              </option>
            ))}
          </select>
        </label>
        <NumberField
          label="Monthly income"
          onChange={(value) =>
            setIncome((current) => ({ ...current, monthlyIncome: value }))
          }
          value={income.monthlyIncome}
        />
      </div>

      <div className="slider-field">
        <div>
          <span>Savings percentage</span>
          <strong>{income.savingsPercentage}%</strong>
        </div>
        <input
          max="80"
          min="0"
          onChange={(event) =>
            setIncome((current) => ({
              ...current,
              savingsPercentage: Number(event.target.value),
            }))
          }
          type="range"
          value={income.savingsPercentage}
        />
      </div>

      <div className="form-grid two-col">
        <div className="slider-field compact">
          <div>
            <span>Hours per day</span>
            <strong>{income.workHoursPerDay}</strong>
          </div>
          <input
            max="14"
            min="1"
            onChange={(event) =>
              setIncome((current) => ({
                ...current,
                workHoursPerDay: Number(event.target.value),
              }))
            }
            type="range"
            value={income.workHoursPerDay}
          />
        </div>
        <div className="slider-field compact">
          <div>
            <span>Days per week</span>
            <strong>{income.workDaysPerWeek}</strong>
          </div>
          <input
            max="7"
            min="1"
            onChange={(event) =>
              setIncome((current) => ({
                ...current,
                workDaysPerWeek: Number(event.target.value),
              }))
            }
            type="range"
            value={income.workDaysPerWeek}
          />
        </div>
      </div>

      <div className="insight-strip">
        <div>
          <span>Monthly savings</span>
          <strong>{formatMoney(monthlySavings, income.currency)}</strong>
        </div>
        <div>
          <span>Estimated hourly value</span>
          <strong>{formatMoney(hourlyValue, income.currency)}</strong>
        </div>
      </div>

      <div className="actions right">
        <button className="primary" onClick={onNext} type="button">
          Next
        </button>
      </div>
    </section>
  )
}

function PurchaseStep({ purchase, setPurchase, onBack, onCalculate }) {
  return (
    <section className="panel form-panel">
      <div className="panel-heading">
        <p className="eyebrow">Step 2</p>
        <h2>Purchase details</h2>
        <p>
          Tell the app what you are considering and how useful it will actually
          be after the excitement fades.
        </p>
      </div>

      <label className="field">
        <span>Item name</span>
        <input
          onChange={(event) =>
            setPurchase((current) => ({
              ...current,
              itemName: event.target.value,
            }))
          }
          placeholder="e.g. iPhone, Bali trip, gym subscription"
          type="text"
          value={purchase.itemName}
        />
      </label>

      <div className="form-grid two-col">
        <NumberField
          label={
            purchase.purchaseType === 'Subscription'
              ? 'Monthly cost'
              : 'Total cost'
          }
          onChange={(value) =>
            setPurchase((current) => ({ ...current, cost: value }))
          }
          value={purchase.cost}
        />
        <NumberField
          label={
            purchase.purchaseType === 'Experience'
              ? 'Memory value months'
              : 'Expected lifespan months'
          }
          onChange={(value) =>
            setPurchase((current) => ({
              ...current,
              expectedLifespan: value,
            }))
          }
          suffix="months"
          value={purchase.expectedLifespan}
        />
      </div>

      <ChoiceGroup
        label="Type of purchase"
        onChange={(value) =>
          setPurchase((current) => ({ ...current, purchaseType: value }))
        }
        options={purchaseTypes}
        value={purchase.purchaseType}
      />

      <RatingGroup
        captions={[
          'Do not need',
          'Nice to have',
          'Useful',
          'Important',
          'Essential',
        ]}
        label="How much do you need it?"
        onChange={(value) =>
          setPurchase((current) => ({ ...current, needScore: value }))
        }
        value={purchase.needScore}
      />

      <RatingGroup
        captions={[
          'Barely',
          'Curious',
          'Want it',
          'Excited',
          'Love it',
        ]}
        label="How much do you want it?"
        onChange={(value) =>
          setPurchase((current) => ({ ...current, wantScore: value }))
        }
        value={purchase.wantScore}
      />

      <ChoiceGroup
        label={
          purchase.purchaseType === 'Experience'
            ? 'Emotional value'
            : 'Usage frequency'
        }
        onChange={(value) =>
          setPurchase((current) => ({ ...current, usageFrequency: value }))
        }
        options={
          purchase.purchaseType === 'Experience'
            ? [
                { value: 'daily', label: 'Life-changing' },
                { value: 'weekly', label: 'Memorable' },
                { value: 'monthly', label: 'Nice' },
                { value: 'rarely', label: 'Forgettable' },
              ]
            : usageOptions
        }
        value={purchase.usageFrequency}
      />

      <div className="form-grid three-col">
        <ChoiceGroup
          label="Urgency"
          onChange={(value) =>
            setPurchase((current) => ({ ...current, urgency: value }))
          }
          options={['Need now', 'Soon', 'Later']}
          value={purchase.urgency}
        />
        <ChoiceGroup
          label="Alternatives checked?"
          onChange={(value) =>
            setPurchase((current) => ({
              ...current,
              alternativeChecked: value,
            }))
          }
          options={['Yes', 'No']}
          value={purchase.alternativeChecked}
        />
        <ChoiceGroup
          label="Regret risk"
          onChange={(value) =>
            setPurchase((current) => ({ ...current, regretRisk: value }))
          }
          options={['Low', 'Medium', 'High']}
          value={purchase.regretRisk}
        />
      </div>

      <div className="actions split">
        <button className="secondary" onClick={onBack} type="button">
          Back
        </button>
        <button className="primary" onClick={onCalculate} type="button">
          Calculate result
        </button>
      </div>
    </section>
  )
}

function ResultCard({ result, onReset, onEdit, onShare }) {
  const { income, purchase, metrics, verdict } = result
  const monthlySavingsMessage =
    metrics.monthlySavings <= 0
      ? 'You currently have no savings capacity for this purchase.'
      : `You need ${formatCompactNumber(metrics.weeksToSave)} weeks to save for it.`

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
              : 'Add valid income and work hours'}
          </p>
        </div>
        <div>
          <span>Saving time</span>
          <strong>
            {Number.isFinite(metrics.monthsToSave)
              ? `${formatCompactNumber(metrics.monthsToSave)} months`
              : 'No savings capacity'}
          </strong>
          <p>{monthlySavingsMessage}</p>
        </div>
        <div>
          <span>Cost per use</span>
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
          Copy share text
        </button>
      </div>
    </section>
  )
}

function HistoryTable({ history, onClear, onDelete, onEdit }) {
  if (history.length === 0) {
    return (
      <section className="panel history-panel empty-history">
        <div>
          <p className="eyebrow">Local history</p>
          <h2>No decisions saved yet</h2>
          <p>Your calculated purchases will appear here on this device.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="panel history-panel">
      <div className="history-heading">
        <div>
          <p className="eyebrow">Local history</p>
          <h2>Decision history</h2>
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

function App() {
  const [activeStep, setActiveStep] = useState(1)
  const [income, setIncome] = useState(initialIncome)
  const [purchase, setPurchase] = useState(initialPurchase)
  const [history, setHistory] = useState(() => loadHistory())
  const [currentResult, setCurrentResult] = useState(null)
  const [shareStatus, setShareStatus] = useState('')
  const [editingId, setEditingId] = useState(null)

  const canCalculate = useMemo(
    () =>
      numberValue(income.monthlyIncome) >= 0 &&
      numberValue(purchase.cost) >= 0 &&
      numberValue(income.workHoursPerDay) > 0 &&
      numberValue(income.workDaysPerWeek) > 0,
    [income, purchase.cost],
  )

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  }, [history])

  function handleCalculate() {
    if (!canCalculate) {
      return
    }

    const result = calculateResult(income, purchase)
    setCurrentResult(result)
    setHistory((current) => [
      result,
      ...current.filter((item) => item.id !== editingId),
    ])
    setActiveStep(3)
    setShareStatus('')
    setEditingId(null)
  }

  function handleReset() {
    setPurchase(initialPurchase)
    setCurrentResult(null)
    setActiveStep(2)
    setShareStatus('')
    setEditingId(null)
  }

  function handleEdit(item = currentResult) {
    if (!item) {
      return
    }

    setIncome(item.income)
    setPurchase(item.purchase)
    setCurrentResult(null)
    setActiveStep(2)
    setShareStatus('')
    setEditingId(item.id)
  }

  async function handleShare() {
    if (!currentResult) {
      return
    }

    const text = `Buy It or Not? ${currentResult.purchase.itemName || 'Purchase'} scored ${currentResult.score}/100: ${currentResult.verdict.label}. ${currentResult.recommendation}`

    try {
      await navigator.clipboard.writeText(text)
      setShareStatus('Share text copied.')
    } catch {
      setShareStatus('Copy failed. Select the result text manually.')
    }
  }

  return (
    <main className="app-shell">
      <section className="hero-section">
        <div>
          <p className="eyebrow">No-backend decision helper</p>
          <h1>Buy It or Not?</h1>
          <p>
            Convert price into work time, savings delay, cost per use, and
            regret risk before you spend.
          </p>
        </div>
        <div className="hero-stat">
          <span>Transparent score</span>
          <strong>100</strong>
          <p>points across money, time, value, and emotion.</p>
        </div>
      </section>

      <StepIndicator activeStep={activeStep} />

      <div className="workspace">
        {activeStep === 1 ? (
          <IncomeStep
            income={income}
            onNext={() => setActiveStep(2)}
            setIncome={setIncome}
          />
        ) : null}

        {activeStep === 2 ? (
          <PurchaseStep
            onBack={() => setActiveStep(1)}
            onCalculate={handleCalculate}
            purchase={purchase}
            setPurchase={setPurchase}
          />
        ) : null}

        {activeStep === 3 && currentResult ? (
          <ResultCard
            onEdit={() => handleEdit()}
            onReset={handleReset}
            onShare={handleShare}
            result={currentResult}
          />
        ) : null}

        {shareStatus ? <p className="toast">{shareStatus}</p> : null}
      </div>

      <HistoryTable
        history={history}
        onClear={() => setHistory([])}
        onDelete={(id) =>
          setHistory((current) => current.filter((item) => item.id !== id))
        }
        onEdit={handleEdit}
      />
    </main>
  )
}

export default App
