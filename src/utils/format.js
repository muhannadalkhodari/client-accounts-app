export const CURRENCY_SYMBOLS = { USD: '$', SYP: 'ل.س' }

// أرقام إنجليزية دائماً بفواصل الآلاف، بحد أقصى منزلتين عشريتين
export function formatAmount(amount) {
  return Number(amount).toLocaleString('en-US', { maximumFractionDigits: 2 })
}

export function formatCurrency(amount, currency) {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency
  return `${formatAmount(amount)} ${symbol}`
}

// وقت نسبي مبسّط بالعربية (لا يغطي كل حالات الجمع اللغوي، كافٍ لعرض قوائم)
export function formatRelativeTime(timestamp) {
  const diff = Date.now() - timestamp
  const minute = 60_000
  const hour = 3_600_000
  const day = 86_400_000

  if (diff < minute) return 'الآن'
  if (diff < hour) return `منذ ${Math.floor(diff / minute)} د`
  if (diff < day) return `منذ ${Math.floor(diff / hour)} س`

  const days = Math.floor(diff / day)
  if (days < 30) return `منذ ${days} يوم`
  const months = Math.floor(days / 30)
  if (months < 12) return `منذ ${months} شهر`
  return `منذ ${Math.floor(months / 12)} سنة`
}
