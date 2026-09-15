import { doc, getDoc, writeBatch } from 'firebase/firestore'
import { db } from '../lib/firebase.js'
import { CLIENTS_COLLECTION, CLIENTS_INDEX_PATH } from '../lib/collections.js'
import { computeBalance, isTransactionDateValid } from '../utils/calculations.js'

const indexRef = doc(db, ...CLIENTS_INDEX_PATH)

function clientRef(clientId) {
  return doc(db, CLIENTS_COLLECTION, clientId)
}

async function loadClient(clientId) {
  const snap = await getDoc(clientRef(clientId))
  if (!snap.exists()) throw new Error('العميل غير موجود')
  return { ref: snap.ref, data: snap.data() }
}

// إضافة معاملة جديدة (قبض أو دفع). هذه هي الحالة الوحيدة التي تُحدّث "آخر تحديث".
export async function addTransaction(clientId, { type, amount, date, description = '' }) {
  const { ref, data } = await loadClient(clientId)
  if (data.status === 'former') {
    throw new Error('لا يمكن إضافة معاملة لملف مغلق قبل إعادة فتحه')
  }
  const existing = data.transactions ?? []
  if (!isTransactionDateValid(date, existing)) {
    throw new Error('تاريخ المعاملة غير صالح وفق قواعد الحساب')
  }

  const newTransaction = {
    id: crypto.randomUUID(),
    type,
    amount,
    date,
    description,
    createdAt: Date.now(),
  }
  const newTransactions = [...existing, newTransaction]
  const newBalance = computeBalance(newTransactions)
  const now = Date.now()

  const batch = writeBatch(db)
  batch.set(ref, { transactions: newTransactions, lastUpdate: now }, { merge: true })
  batch.set(
    indexRef,
    { clients: { [clientId]: { balance: newBalance, lastUpdate: now } } },
    { merge: true },
  )
  await batch.commit()
  return newTransaction
}

// تعديل معاملة موجودة. لا يُحدّث "آخر تحديث" حسب المواصفات.
export async function updateTransaction(clientId, transactionId, updatedFields) {
  const { ref, data } = await loadClient(clientId)
  const existing = data.transactions ?? []
  const target = existing.find((t) => t.id === transactionId)
  if (!target) throw new Error('المعاملة غير موجودة')

  const others = existing.filter((t) => t.id !== transactionId)
  const nextDate = updatedFields.date ?? target.date
  if (!isTransactionDateValid(nextDate, others)) {
    throw new Error('تاريخ المعاملة غير صالح وفق قواعد الحساب')
  }

  const newTransactions = existing.map((t) =>
    t.id === transactionId ? { ...t, ...updatedFields } : t,
  )
  const newBalance = computeBalance(newTransactions)

  const batch = writeBatch(db)
  batch.set(ref, { transactions: newTransactions }, { merge: true })
  batch.set(
    indexRef,
    { clients: { [clientId]: { balance: newBalance } } },
    { merge: true },
  )
  await batch.commit()
}

// حذف معاملة. لا يُحدّث "آخر تحديث" حسب المواصفات.
export async function deleteTransaction(clientId, transactionId) {
  const { ref, data } = await loadClient(clientId)
  const existing = data.transactions ?? []
  const newTransactions = existing.filter((t) => t.id !== transactionId)
  const newBalance = computeBalance(newTransactions)

  const batch = writeBatch(db)
  batch.set(ref, { transactions: newTransactions }, { merge: true })
  batch.set(
    indexRef,
    { clients: { [clientId]: { balance: newBalance } } },
    { merge: true },
  )
  await batch.commit()
}
