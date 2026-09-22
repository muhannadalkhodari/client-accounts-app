import { useState } from 'react'
import SegmentedTabs from './SegmentedTabs.jsx'

const TYPE_OPTIONS = [
  { value: 'receipt', label: 'قبض' },
  { value: 'payment', label: 'دفع' },
]

export default function TransactionSheet({
  initial,
  minDate,
  maxDate,
  onSave,
  onDelete,
  onClose,
}) {
  const isEdit = Boolean(initial)
  const [type, setType] = useState(initial?.type ?? 'receipt')
  const [amount, setAmount] = useState(initial?.amount ?? '')
  const [date, setDate] = useState(initial?.date ?? maxDate)
  const [description, setDescription] = useState(initial?.description ?? '')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSave() {
    setError('')
    const numAmount = Number(amount)
    if (!numAmount || numAmount <= 0) {
      setError('أدخل مبلغاً صحيحاً أكبر من صفر')
      return
    }
    if (minDate && date < minDate) {
      setError(`لا يمكن أن يكون التاريخ أقدم من ${minDate}`)
      return
    }
    if (date > maxDate) {
      setError('لا يمكن أن يكون التاريخ في المستقبل')
      return
    }
    setBusy(true)
    try {
      await onSave({ type, amount: numAmount, date, description: description.trim() })
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  async function handleDelete() {
    setBusy(true)
    try {
      await onDelete()
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-3xl border-t border-ledger-border bg-ledger-surface px-5 pb-8 pt-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ledger-border" />
        <h2 className="mb-4 text-base font-semibold text-ledger-text">
          {isEdit ? 'تعديل معاملة' : 'إضافة معاملة'}
        </h2>

        <div className="flex flex-col gap-4">
          <SegmentedTabs options={TYPE_OPTIONS} value={type} onChange={setType} />

          <div>
            <label className="mb-1.5 block text-sm text-ledger-muted">المبلغ</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="numerals w-full rounded-xl border border-ledger-border bg-ledger-surface-raised px-4 py-2.5 text-sm text-ledger-text focus:outline-none focus:ring-1 focus:ring-ledger-accent"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-ledger-muted">التاريخ</label>
            <input
              type="date"
              dir="ltr"
              value={date}
              min={minDate || undefined}
              max={maxDate}
              onChange={(e) => setDate(e.target.value)}
              className="numerals w-full rounded-xl border border-ledger-border bg-ledger-surface-raised px-4 py-2.5 text-sm text-ledger-text focus:outline-none focus:ring-1 focus:ring-ledger-accent"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-ledger-muted">وصف (اختياري)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-ledger-border bg-ledger-surface-raised px-4 py-2.5 text-sm text-ledger-text focus:outline-none focus:ring-1 focus:ring-ledger-accent"
            />
          </div>

          {error && <p className="text-sm text-ledger-payment">{error}</p>}

          <button
            type="button"
            disabled={busy}
            onClick={handleSave}
            className="rounded-xl bg-ledger-accent py-3 text-sm font-medium text-ledger-bg disabled:opacity-60"
          >
            {busy ? 'جارٍ الحفظ…' : 'حفظ'}
          </button>

          {isEdit && (
            <button
              type="button"
              disabled={busy}
              onClick={handleDelete}
              className="rounded-xl border border-ledger-payment/40 py-3 text-sm font-medium text-ledger-payment disabled:opacity-60"
            >
              حذف المعاملة
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
