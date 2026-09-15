export default function SegmentedTabs({ options, value, onChange }) {
  return (
    <div className="grid grid-cols-3 gap-1 rounded-xl border border-ledger-border bg-ledger-surface p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded-lg py-2 text-sm transition-colors ${
            value === opt.value
              ? 'bg-ledger-accent text-ledger-bg font-medium'
              : 'text-ledger-muted'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
