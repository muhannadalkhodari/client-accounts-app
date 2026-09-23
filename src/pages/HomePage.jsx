import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TreasurySummary from '../components/TreasurySummary.jsx'
import SegmentedTabs from '../components/SegmentedTabs.jsx'
import ClientListItem from '../components/ClientListItem.jsx'
import ThemeToggle from '../components/ThemeToggle.jsx'
import InstallPrompt from '../components/InstallPrompt.jsx'
import { getClientsIndex } from '../services/clientService.js'
import { computeTreasuryTotals } from '../utils/calculations.js'

const TABS = [
  { value: 'current', label: 'الحاليون' },
  { value: 'former', label: 'السابقون' },
  { value: 'all', label: 'الكل' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [clientsMap, setClientsMap] = useState(null)
  const [tab, setTab] = useState('current')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('lastUpdate')
  const [error, setError] = useState('')

  useEffect(() => {
    getClientsIndex()
      .then(setClientsMap)
      .catch((err) => setError(err.message))
  }, [])

  const clients = useMemo(() => {
    if (!clientsMap) return []
    return Object.entries(clientsMap).map(([id, data]) => ({ id, ...data }))
  }, [clientsMap])

  const treasuryTotals = useMemo(() => computeTreasuryTotals(clientsMap ?? {}), [clientsMap])

  const visibleClients = useMemo(() => {
    let list = clients
    if (tab !== 'all') list = list.filter((c) => c.status === tab)
    const q = search.trim()
    if (q) list = list.filter((c) => c.name.includes(q) || (c.phone ?? '').includes(q))
    const sorted = [...list]
    if (sortBy === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name, 'ar'))
    else sorted.sort((a, b) => (b.lastUpdate ?? 0) - (a.lastUpdate ?? 0))
    return sorted
  }, [clients, tab, search, sortBy])

  return (
    <div className="min-h-screen bg-ledger-bg pb-24">
      <header className="flex items-center justify-between px-4 pt-8 pb-4">
        <h1 className="text-lg font-semibold text-ledger-text">حسابات العملاء</h1>
        <ThemeToggle />
      </header>

      <div className="px-4">
        <InstallPrompt />

        {error && (
          <p className="mb-4 rounded-xl border border-ledger-payment/40 bg-ledger-payment/10 px-4 py-3 text-sm text-ledger-payment">
            تعذّر تحميل البيانات: {error}
          </p>
        )}

        {clientsMap && <TreasurySummary totals={treasuryTotals} />}

        <div className="mt-5">
          <SegmentedTabs options={TABS} value={tab} onChange={setTab} />
        </div>

        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالاسم أو رقم الهاتف"
            className="flex-1 rounded-xl border border-ledger-border bg-ledger-surface px-4 py-2.5 text-sm text-ledger-text placeholder:text-ledger-muted focus:outline-none focus:ring-1 focus:ring-ledger-accent"
          />
          <button
            type="button"
            onClick={() => setSortBy((s) => (s === 'lastUpdate' ? 'name' : 'lastUpdate'))}
            className="shrink-0 rounded-xl border border-ledger-border bg-ledger-surface px-3 text-xs text-ledger-muted"
            title="تبديل الفرز"
          >
            {sortBy === 'lastUpdate' ? 'آخر تحديث' : 'أبجدياً'}
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          {clientsMap === null && !error && (
            <p className="py-10 text-center text-sm text-ledger-muted">جارٍ التحميل…</p>
          )}
          {clientsMap && visibleClients.length === 0 && (
            <p className="py-10 text-center text-sm text-ledger-muted">
              {search ? 'لا نتائج مطابقة' : 'لا يوجد عملاء في هذا القسم بعد'}
            </p>
          )}
          {visibleClients.map((client) => (
            <ClientListItem key={client.id} client={client} onClick={() => navigate(`/clients/${client.id}`)} />
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate('/clients/new')}
        aria-label="إضافة عميل"
        className="fixed bottom-6 left-6 flex h-14 w-14 items-center justify-center rounded-full bg-ledger-accent text-2xl font-light text-ledger-bg shadow-lg"
      >
        +
      </button>
    </div>
  )
}
