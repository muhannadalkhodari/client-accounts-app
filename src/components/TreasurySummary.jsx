import { formatCurrency } from '../utils/format.js'

// يعرض إجمالي الخزينة لكل عملة على حدة، ويُخفي أي عملة رصيدها صفر بالضبط
export default function TreasurySummary({ totals }) {
  const entries = Object.entries(totals).filter(([, amount]) => amount !== 0)

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-ledger-border bg-ledger-surface px-5 py-4 text-center text-sm text-ledger-muted">
        لا يوجد رصيد في الخزينة حالياً
      </div>
    )
  }

  return (
    <div className={`grid gap-3 ${entries.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
      {entries.map(([currency, amount]) => (
        <div
          key={currency}
          className="rounded-2xl border border-ledger-border bg-ledger-surface px-4 py-3"
        >
          <p className="text-xs text-ledger-muted">إجمالي الخزينة</p>
          <p className="numerals mt-1 text-xl font-semibold text-ledger-accent">
            {formatCurrency(amount, currency)}
          </p>
        </div>
      ))}
    </div>
  )
}
