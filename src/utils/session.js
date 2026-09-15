// يبقي المستخدم مسجّل الدخول على هذا الجهاز طالما استخدم التطبيق مرة واحدة
// على الأقل كل أسبوع، حسب المواصفات المتفق عليها.
const STORAGE_KEY = 'lastLoginAt'
const VALID_DAYS = 7
const VALID_MS = VALID_DAYS * 24 * 60 * 60 * 1000

export function markLoggedIn() {
  localStorage.setItem(STORAGE_KEY, String(Date.now()))
}

export function hasValidSession() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return false
  const last = Number(raw)
  if (Number.isNaN(last)) return false
  return Date.now() - last < VALID_MS
}
