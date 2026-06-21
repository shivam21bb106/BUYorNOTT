export function numberValue(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

export function formatCompactNumber(value, maximumFractionDigits = 1) {
  if (!Number.isFinite(value)) {
    return '0'
  }

  return new Intl.NumberFormat('en', {
    maximumFractionDigits,
  }).format(value)
}

export function formatMoney(value, currencyCode) {
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: value >= 100 ? 0 : 2,
  }).format(Number.isFinite(value) ? value : 0)
}
