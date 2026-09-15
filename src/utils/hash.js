// تشفير رمز PIN باستخدام SHA-256 عبر واجهة المتصفح المدمجة (Web Crypto API).
// تذكير: هذا تشفير من طرف الواجهة فقط لمنع ظهور الرقم كنص صريح في قاعدة البيانات؛
// الحماية الفعلية للبيانات تأتي من Firebase Anonymous Auth + قواعد الأمان،
// كما هو موثّق في مواصفات المشروع.
export async function hashPin(pin) {
  const data = new TextEncoder().encode(pin)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function verifyPin(pin, storedHash) {
  const hash = await hashPin(pin)
  return hash === storedHash
}
