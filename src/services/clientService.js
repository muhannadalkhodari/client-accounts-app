import {
  doc,
  getDoc,
  collection,
  writeBatch,
  deleteField,
} from 'firebase/firestore'
import { db } from '../lib/firebase.js'
import { CLIENTS_COLLECTION, CLIENTS_INDEX_PATH } from '../lib/collections.js'
import { computeBalance } from '../utils/calculations.js'

const indexRef = doc(db, ...CLIENTS_INDEX_PATH)

function clientRef(clientId) {
  return doc(db, CLIENTS_COLLECTION, clientId)
}

// قراءة ملف الفهرس الموجز الذي تعتمد عليه الصفحة الرئيسية وقائمة العملاء
export async function getClientsIndex() {
  const snap = await getDoc(indexRef)
  return snap.exists() ? snap.data().clients ?? {} : {}
}

// قراءة ملف عميل واحد كاملاً (بياناته + كل معاملاته)
export async function getClient(clientId) {
  const snap = await getDoc(clientRef(clientId))
  if (!snap.exists()) throw new Error('العميل غير موجود')
  return { id: snap.id, ...snap.data() }
}

export async function createClient({
  name,
  countryCode,
  phone,
  currency,
  notes = '',
  commissionPercent = 0,
}) {
  const newRef = doc(collection(db, CLIENTS_COLLECTION))
  const now = Date.now()
  const clientData = {
    name,
    countryCode,
    phone,
    currency,
    notes,
    commissionPercent,
    status: 'current',
    transactions: [],
    createdAt: now,
    lastUpdate: now,
  }

  const batch = writeBatch(db)
  batch.set(newRef, clientData)
  batch.set(
    indexRef,
    {
      clients: {
        [newRef.id]: {
          name,
          phone,
          currency,
          status: 'current',
          balance: 0,
          lastUpdate: now,
        },
      },
    },
    { merge: true },
  )
  await batch.commit()
  return { id: newRef.id, ...clientData }
}

// تعديل بيانات العميل الأساسية (لا يُحدّث "آخر تحديث" حسب المواصفات؛
// هذا التوقيت يتغيّر فقط عند إضافة معاملة جديدة)
export async function updateClient(clientId, fields) {
  const batch = writeBatch(db)
  batch.set(clientRef(clientId), fields, { merge: true })

  const indexPatch = {}
  if ('name' in fields) indexPatch.name = fields.name
  if ('phone' in fields) indexPatch.phone = fields.phone
  if ('currency' in fields) indexPatch.currency = fields.currency
  if (Object.keys(indexPatch).length > 0) {
    const patch = {}
    for (const [k, v] of Object.entries(indexPatch)) {
      patch[`clients.${clientId}.${k}`] = v
    }
    batch.set(indexRef, patch, { merge: true })
  }
  await batch.commit()
}

// حذف نهائي للعميل — التأكيد بكتابة الاسم مسؤولية واجهة المستخدم قبل استدعاء هذه الدالة
export async function deleteClient(clientId) {
  const batch = writeBatch(db)
  batch.delete(clientRef(clientId))
  // deleteField() يحذف مفتاح هذا العميل فقط من map الفهرس، ويُبقي باقي العملاء كما هم
  batch.set(
    indexRef,
    { clients: { [clientId]: deleteField() } },
    { merge: true },
  )
  await batch.commit()
}

export async function closeClientFile(clientId) {
  const client = await getClient(clientId)
  const balance = computeBalance(client.transactions)
  if (balance !== 0) {
    throw new Error('لا يمكن إغلاق الملف إلا إذا كان رصيد الخزينة صفراً بالضبط')
  }
  const batch = writeBatch(db)
  batch.set(clientRef(clientId), { status: 'former' }, { merge: true })
  batch.set(
    indexRef,
    { clients: { [clientId]: { status: 'former' } } },
    { merge: true },
  )
  await batch.commit()
}

export async function reopenClientFile(clientId) {
  const batch = writeBatch(db)
  batch.set(clientRef(clientId), { status: 'current' }, { merge: true })
  batch.set(
    indexRef,
    { clients: { [clientId]: { status: 'current' } } },
    { merge: true },
  )
  await batch.commit()
}
