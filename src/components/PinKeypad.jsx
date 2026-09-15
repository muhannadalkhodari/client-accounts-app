const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'backspace']

export default function PinKeypad({ onDigit, onBackspace, disabled = false }) {
  return (
    <div className="mx-auto grid max-w-xs grid-cols-3 gap-3" dir="ltr">
      {KEYS.map((key, i) => {
        if (key === '') return <div key={i} />
        if (key === 'backspace') {
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={onBackspace}
              aria-label="حذف"
              className="flex h-16 items-center justify-center rounded-2xl text-ledger-muted transition-colors active:bg-ledger-surface-raised disabled:opacity-40"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M9 6h11v12H9l-6-6 6-6Z" />
                <path d="M14 10l4 4M18 10l-4 4" />
              </svg>
            </button>
          )
        }
        return (
          <button
            key={i}
            type="button"
            disabled={disabled}
            onClick={() => onDigit(key)}
            className="h-16 rounded-2xl border border-ledger-border bg-ledger-surface text-xl font-medium text-ledger-text transition-colors active:bg-ledger-surface-raised disabled:opacity-40"
          >
            {key}
          </button>
        )
      })}
    </div>
  )
}
