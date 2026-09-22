import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TransactionRow from '../components/TransactionRow.jsx'
import TransactionSheet from '../components/TransactionSheet.jsx'
import ConfirmTypeNameModal from '../components/ConfirmTypeNameModal.jsx'
import {
  getClient,
  deleteClient,
  closeClientFile,
  reopenClientFile,
} from '../services/clientService.js'
import {
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from '../services/transactionService.js'
import {
  computeTotals,
  computeBalance,
  computeOfficeProfit,
  getMinAllowedDate,
  getMaxAllowedDate,
} from '../utils/calculations.js'
import { formatCurrency } from '../utils/format.js'
import { generateClientPdf } from '../utils/pdf.js'
import { shareClientPdf } from '../utils/share.js'

export default function ClientDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [client, setClient] = useState(null)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [sheetMode, setSheetMode] = useState(null) // null | 'add' | transaction object being edited
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [statusBusy, setStatusBusy] = useState(false)

  const reload = useCallback(() => {
    return getClient(id)
      .then(setClient)
      .catch((err) => setError(err.message))
  }, [id])

  useEffect(() => {
    reload()
  }, [reload])

  const transactions = client?.transactions ?? []
  const totals = useMemo(() => computeTotals(transactions), [transactions])
  const balance = useMemo(() => computeBalance(transactions), [transactions])
  const officeProfit = useMemo(
    () => computeOfficeProfit(transactions, client?.commissionPercent ?? 0),
    [transactions, client],
  )
  const sortedTransactions = useMemo(
    () => [...transactions].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)),
    [transactions],
  )

  const maxDate = getMaxAllowedDate()

  function openAddSheet() {
    setActionError('')
    setSheetMode('add')
  }
  function openEditSheet(transaction) {
    setActionError('')
    setSheetMode(transaction)
  }
  function closeSheet() {
    setSheetMode(null)
  }

  async function handleSaveTransaction(data) {
    if (sheetMode === 'add') {
      await addTransaction(id, data)
    } else {
      await updateTransaction(id, sheetMode.id, data)
    }
    await reload()
    setSheetMode(null)
  }

  async function handleDeleteTransaction() {
    await deleteTransaction(id, sheetMode.id)
    await reload()
    setSheetMode(null)
  }

  async function handleToggleStatus() {
    setActionError('')
    setStatusBusy(true)
    try {
      if (client.status === 'current') {
        await closeClientFile(id)
      } else {
        await reopenClientFile(id)
      }
      await reload()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setStatusBusy(false)
    }
  }

  async function handleShare() {
    setActionError('')
    setSharing(true)
    try {
      const blob = await generateClientPdf(transactions)
      const fullPhone = `${client.countryCode ?? ''}${client.phone ?? ''}`.replace(/[^0-9]/g, '')
      await shareClientPdf({ blob, fileName: `${client.name}.pdf`, phoneFullNumber: fullPhone })
    } catch (err) {
      setActionError(err.message)
    } finally {
      setSharing(false)
    }
  }

  async function handleDeleteClient() {
    await deleteClient(id)
    navigate('/home', { replace: true })
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ledger-bg px-6 text-center text-ledger-payment">
        {error}
      </div>
    )
  }
  if (!client) {
    return <div className="min-h-screen bg-ledger-bg" />
  }

  const editMinDate =
    sheetMode && sheetMode !== 'add'
      ? getMinAllowedDate(transactions.filter((t) => t.id !== sheetMode.id))
      : getMinAllowedDate(transactions)

  return (
    <div className="min-h-screen bg-ledger-bg px-4 py-8 pb-28">
      <div className="mb-5 flex items-center gap-3">
        <button type="button" onClick={() => navigate('/home')} aria-label="رجوع" className="text-ledger-muted">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M10 6l6 6-6 6" />
          </svg>
        </button>
        <h1 className="flex-1 truncate text-lg font-semibold text-ledger-text">{client.name}</h1>
        <button
          type="button"
          onClick={() => navigate(`/clients/${id}/edit`)}
          aria-label="تعديل بيانات العميل"
          className="text-ledger-muted"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        </button>
      </div>

      {client.status === 'former' && (
        <div className="mb-4 rounded-xl border border-ledger-border bg-ledger-surface px-4 py-2 text-center text-xs text-ledger-muted">
          هذا الملف مغلق — لا يمكن إضافة معاملات جديدة قبل إعادة فتحه
        </div>
      )}

      <div className="rounded-2xl border border-ledger-border bg-ledger-surface px-5 py-4">
        <p className="text-xs text-ledger-muted">رصيد الخزينة</p>
        <p
          className={`numerals mt-1 text-2xl font-semibold ${
            balance > 0 ? 'text-ledger-receipt' : balance < 0 ? 'text-ledger-payment' : 'text-ledger-text'
          }`}
        >
          {formatCurrency(balance, client.currency)}
        </p>
      </div>

      <div className="mt-3 rounded-2xl border border-ledger-border bg-ledger-surface-raised px-5 py-3">
        <p className="text-xs text-ledger-muted">ربح المكتب ({client.commissionPercent ?? 0}%)</p>
        <p className="numerals mt-1 text-base font-semibold text-ledger-accent">
          {formatCurrency(officeProfit, client.currency)}
        </p>
      </div>

      {client.notes && (
        <div className="mt-3 rounded-2xl border border-ledger-border bg-ledger-surface px-5 py-3">
          <p className="text-xs text-ledger-muted">ملاحظات</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-ledger-text">{client.notes}</p>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={handleToggleStatus}
          disabled={statusBusy}
          className="flex-1 rounded-xl border border-ledger-border py-2.5 text-xs text-ledger-muted disabled:opacity-50"
        >
          {client.status === 'current' ? 'إغلاق الملف' : 'إعادة فتح الملف'}
        </button>
        <button
          type="button"
          onClick={handleShare}
          disabled={sharing}
          className="flex-1 rounded-xl bg-ledger-accent py-2.5 text-xs font-medium text-ledger-bg disabled:opacity-60"
        >
          {sharing ? 'جارٍ التجهيز…' : 'تصدير ومشاركة PDF'}
        </button>
      </div>

      {actionError && <p className="mt-3 text-sm text-ledger-payment">{actionError}</p>}

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ledger-text">المعاملات</h2>
        <div className="flex gap-3 text-xs">
          <span className="text-ledger-receipt">
            قبض <span className="numerals">{formatCurrency(totals.totalReceipts, client.currency)}</span>
          </span>
          <span className="text-ledger-payment">
            دفع <span className="numerals">{formatCurrency(totals.totalPayments, client.currency)}</span>
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {sortedTransactions.length === 0 && (
          <p className="py-8 text-center text-sm text-ledger-muted">لا توجد معاملات بعد</p>
        )}
        {sortedTransactions.map((t) => (
          <TransactionRow key={t.id} transaction={t} onClick={() => openEditSheet(t)} />
        ))}
      </div>

      {client.status === 'current' && (
        <button
          type="button"
          onClick={openAddSheet}
          aria-label="إضافة معاملة"
          className="fixed bottom-6 left-6 flex h-14 w-14 items-center justify-center rounded-full bg-ledger-accent text-2xl font-light text-ledger-bg shadow-lg"
        >
          +
        </button>
      )}

      <button
        type="button"
        onClick={() => setShowDeleteModal(true)}
        className="mt-10 w-full rounded-xl border border-ledger-payment/30 py-2.5 text-xs text-ledger-payment"
      >
        حذف العميل نهائياً
      </button>

      {sheetMode && (
        <TransactionSheet
          initial={sheetMode === 'add' ? null : sheetMode}
          minDate={editMinDate}
          maxDate={maxDate}
          onSave={handleSaveTransaction}
          onDelete={sheetMode !== 'add' ? handleDeleteTransaction : undefined}
          onClose={closeSheet}
        />
      )}

      {showDeleteModal && (
        <ConfirmTypeNameModal
          expectedName={client.name}
          title="حذف العميل"
          warning="سيُحذف هذا العميل وكل معاملاته نهائياً ولا يمكن التراجع عن ذلك."
          onConfirm={handleDeleteClient}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  )
}
