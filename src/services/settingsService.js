import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase.js'
import { SETTINGS_MAIN_PATH } from '../lib/collections.js'
import { hashPin, verifyPin } from '../utils/hash.js'

const settingsRef = doc(db, ...SETTINGS_MAIN_PATH)

// يُستخدم عند أول تشغيل للتطبيق فقط: لا يوجد بعد رمز PIN محفوظ.
export async function hasPinConfigured() {
  const snap = await getDoc(settingsRef)
  return snap.exists() && !!snap.data()?.pinHash
}

export async function setupPin(pin) {
  const pinHash = await hashPin(pin)
  await setDoc(settingsRef, { pinHash, updatedAt: Date.now() })
}

export async function checkPin(pin) {
  const snap = await getDoc(settingsRef)
  if (!snap.exists()) return false
  return verifyPin(pin, snap.data().pinHash)
}

export async function changePin(newPin) {
  const pinHash = await hashPin(newPin)
  await setDoc(settingsRef, { pinHash, updatedAt: Date.now() }, { merge: true })
}
