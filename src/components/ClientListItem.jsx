import { formatCurrency, formatRelativeTime } from '../utils/format.js'

export default function ClientListItem({ client, onClick }) {
  const balanceColor =
    client.balance > 0
      ? 'text-ledger-receipt'
      : client.balance < 0
        ? 'text-ledger-payment'
        : 'text-ledger-muted'

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-2xl border border-ledger-border bg-ledger-surface px-4 py-3 text-right transition-colors active:bg-ledger-surface-raised"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium text-ledger-text">{client.name}</p>
          {client.status === 'former' && (
            <span className="shrink-0 rounded-md border border-ledger-border px-1.5 py-0.5 text-[11px] text-ledger-muted">
              ملف مغلق
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-ledger-muted">{formatRelativeTime(client.lastUpdate)}</p>
      </div>
      <p className={`numerals shrink-0 text-sm font-semibold ${balanceColor}`}>
        {formatCurrency(client.balance, client.currency)}
      </p>
    </button>
  )
}
