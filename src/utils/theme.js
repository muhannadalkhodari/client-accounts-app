// إدارة تفضيل الوضع الداكن/المضيء. المضيء هو الافتراضي دائماً؛ الوضع الداكن
// يُفعَّل فقط إذا اختاره المستخدم صراحة، ويُحفظ الاختيار محلياً على الجهاز.
const STORAGE_KEY = 'theme'

export function getStoredTheme() {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'dark' ? 'dark' : 'light'
}

export function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark')
  } else {
    document.documentElement.removeAttribute('data-theme')
  }
}

export function setStoredTheme(theme) {
  localStorage.setItem(STORAGE_KEY, theme)
  applyTheme(theme)
}
