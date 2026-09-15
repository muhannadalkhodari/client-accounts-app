import { formatAmount } from '../utils/format.js'

export default function TransactionRow({ transaction, onClick }) {
  const isReceipt = transaction.type === 'receipt'
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl border border-ledger-border bg-ledger-surface px-4 py-3 text-right"
    >
      <div className="min-w-0">
        <p className="numerals text-xs text-ledger-muted">{transaction.date}</p>
        {transaction.description && (
          <p className="mt-0.5 truncate text-sm text-ledger-text">{transaction.description}</p>
        )}
      </div>
      <p
        className={`numerals shrink-0 text-sm font-semibold ${
          isReceipt ? 'text-ledger-receipt' : 'text-ledger-payment'
        }`}
      >
        {isReceipt ? '+' : '-'}
        {formatAmount(transaction.amount)}
      </p>
    </button>
  )
}
