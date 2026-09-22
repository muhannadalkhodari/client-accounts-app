import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PhoneInput from '../components/PhoneInput.jsx'
import SegmentedTabs from '../components/SegmentedTabs.jsx'
import { getClient, createClient, updateClient } from '../services/clientService.js'

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'دولار' },
  { value: 'SYP', label: 'ليرة سورية' },
]

export default function AddEditClientPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [countryCode, setCountryCode] = useState('+963')
  const [phone, setPhone] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [commissionPercent, setCommissionPercent] = useState(0)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!isEdit) return
    getClient(id)
      .then((client) => {
        setName(client.name)
        setCountryCode(client.countryCode ?? '+963')
        setPhone(client.phone ?? '')
        setCurrency(client.currency ?? 'USD')
        setCommissionPercent(client.commissionPercent ?? 0)
        setNotes(client.notes ?? '')
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('الاسم مطلوب')
      return
    }
    if (!phone.trim()) {
      setError('رقم الهاتف مطلوب')
      return
    }

    const payload = {
      name: name.trim(),
      countryCode,
      phone: phone.trim(),
      currency,
      commissionPercent: Number(commissionPercent) || 0,
      notes: notes.trim(),
    }

    setSaving(true)
    try {
      if (isEdit) {
        await updateClient(id, payload)
        navigate(`/clients/${id}`, { replace: true })
      } else {
        const created = await createClient(payload)
        navigate(`/clients/${created.id}`, { replace: true })
      }
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-ledger-bg" />
  }

  return (
    <div className="min-h-screen bg-ledger-bg px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="رجوع"
          className="text-ledger-muted"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M10 6l6 6-6 6" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-ledger-text">
          {isEdit ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="mb-1.5 block text-sm text-ledger-muted">الاسم</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-ledger-border bg-ledger-surface px-4 py-2.5 text-sm text-ledger-text focus:outline-none focus:ring-1 focus:ring-ledger-accent"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-ledger-muted">رقم الهاتف</label>
          <PhoneInput
            countryCode={countryCode}
            phone={phone}
            onCountryChange={setCountryCode}
            onPhoneChange={setPhone}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-ledger-muted">عملة الحساب</label>
          <SegmentedTabs options={CURRENCY_OPTIONS} value={currency} onChange={setCurrency} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-ledger-muted">نسبة عمولة المكتب (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={commissionPercent}
            onChange={(e) => setCommissionPercent(e.target.value)}
            className="numerals w-full rounded-xl border border-ledger-border bg-ledger-surface px-4 py-2.5 text-sm text-ledger-text focus:outline-none focus:ring-1 focus:ring-ledger-accent"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-ledger-muted">ملاحظات (اختياري)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-xl border border-ledger-border bg-ledger-surface px-4 py-2.5 text-sm text-ledger-text focus:outline-none focus:ring-1 focus:ring-ledger-accent"
          />
        </div>

        {error && <p className="text-sm text-ledger-payment">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="mt-2 rounded-xl bg-ledger-accent py-3 text-sm font-medium text-ledger-bg disabled:opacity-60"
        >
          {saving ? 'جارٍ الحفظ…' : 'حفظ'}
        </button>
      </form>
    </div>
  )
}
