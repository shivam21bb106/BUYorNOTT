export const HISTORY_KEY = 'buy-it-or-not-history-v1'

export const currencyOptions = [
  { code: 'USD', symbol: '$' },
  { code: 'INR', symbol: '\u20b9' },
  { code: 'EUR', symbol: '\u20ac' },
  { code: 'GBP', symbol: '\u00a3' },
  { code: 'JPY', symbol: '\u00a5' },
]

export const usageOptions = [
  { value: 'rarely', label: 'Rarely' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'daily', label: 'Daily' },
]

export const purchaseTypes = ['Product', 'Experience', 'Subscription']

export const initialIncome = {
  currency: 'USD',
  monthlyIncome: 5000,
  savingsPercentage: 20,
  workHoursPerDay: 8,
  workDaysPerWeek: 5,
}

export const initialPurchase = {
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
