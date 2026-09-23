import { useEffect, useState } from 'react'

// يعرض شريطاً بسيطاً لتثبيت التطبيق على الشاشة الرئيسية، بدل الاعتماد فقط
// على قائمة المتصفح التي لا ينتبه إليها كثيرون. يظهر فقط عندما يُعلن المتصفح
// أن التطبيق قابل للتثبيت فعلاً، ويختفي تلقائياً إذا كان مثبَّتاً بالفعل.
export default function InstallPrompt() {
  const [deferredEvent, setDeferredEvent] = useState(null)
  const [installed, setInstalled] = useState(
    window.matchMedia('(display-mode: standalone)').matches,
  )

  useEffect(() => {
    function handleBeforeInstall(e) {
      e.preventDefault()
      setDeferredEvent(e)
    }
    function handleInstalled() {
      setInstalled(true)
      setDeferredEvent(null)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  if (installed || !deferredEvent) return null

  async function handleInstall() {
    deferredEvent.prompt()
    await deferredEvent.userChoice
    setDeferredEvent(null)
  }

  return (
    <div className="mb-4 flex items-center justify-between rounded-xl border border-ledger-border bg-ledger-surface px-4 py-3">
      <span className="text-sm text-ledger-text">ثبّت التطبيق على شاشتك الرئيسية للوصول السريع</span>
      <button
        type="button"
        onClick={handleInstall}
        className="shrink-0 rounded-lg bg-ledger-accent px-3 py-1.5 text-xs font-medium text-ledger-bg"
      >
        تثبيت
      </button>
    </div>
  )
}
