import { clamp, numberValue } from './numberFormat'

export function getMonthlySavings(income) {
  return (
    numberValue(income.monthlyIncome) *
    (numberValue(income.savingsPercentage) / 100)
  )
}

export function getHourlyValue(income) {
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
      eyebrow: 'Green light',
    }
  }

  if (score >= 70) {
    return {
      label: 'Looks solid',
      tone: 'good',
      eyebrow: 'Almost a yes',
    }
  }

  if (score >= 55) {
    return {
      label: 'Wait a bit',
      tone: 'warning',
      eyebrow: 'Not urgent',
    }
  }

  if (score >= 40) {
    return {
      label: 'Sleep on it',
      tone: 'caution',
      eyebrow: 'Mixed feelings',
    }
  }

  return {
    label: 'Skip for now',
    tone: 'danger',
    eyebrow: 'Wallet says no',
  }
}

function buildRecommendation({ metrics, score, verdict }) {
  if (metrics.monthlySavings <= 0) {
    return 'Right now there is no monthly savings room for this. Sort the savings gap first, then come back for a cleaner yes or no.'
  }

  if (score >= 85) {
    return 'This one looks pretty safe to buy. It fits your savings rhythm, the value is strong, and regret risk is not waving a big red flag.'
  }

  if (score >= 70) {
    return 'This is probably fine, just do the timing check. If you can buy it without poking your emergency money, it passes the vibe check.'
  }

  if (score >= 55) {
    return 'Give it 30 days. You clearly want it, but the money/time side is not giving a confident yes yet.'
  }

  if (verdict.label === 'Sleep on it') {
    return 'This is in the messy middle. Compare a few alternatives, try to lower the cost, and see if you still care tomorrow.'
  }

  return 'Skip this one for now. It asks for too much money or time compared with how much you need it and how often you will use it.'
}

export function calculateResult(income, purchase) {
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
