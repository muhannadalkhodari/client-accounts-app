import { useState } from 'react'

export default function ConfirmTypeNameModal({ expectedName, title, warning, onConfirm, onClose }) {
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)
  const matches = value.trim() === expectedName

  async function handleConfirm() {
    if (!matches) return
    setBusy(true)
    await onConfirm()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl border border-ledger-border bg-ledger-surface p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold text-ledger-text">{title}</h2>
        <p className="mt-2 text-sm text-ledger-muted">{warning}</p>
        <p className="mt-3 text-sm text-ledger-text">
          للتأكيد، اكتب اسم العميل: <span className="font-semibold">{expectedName}</span>
        </p>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="mt-2 w-full rounded-xl border border-ledger-border bg-ledger-surface-raised px-4 py-2.5 text-sm text-ledger-text focus:outline-none focus:ring-1 focus:ring-ledger-accent"
        />
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-ledger-border py-2.5 text-sm text-ledger-muted"
          >
            إلغاء
          </button>
          <button
            type="button"
            disabled={!matches || busy}
            onClick={handleConfirm}
            className="flex-1 rounded-xl bg-ledger-payment py-2.5 text-sm font-medium text-white disabled:opacity-40"
          >
            حذف نهائياً
          </button>
        </div>
      </div>
    </div>
  )
}
