import { useRegisterSW } from 'virtual:pwa-register/react'

// يُشعر المستخدم بوجود نسخة أحدث من التطبيق جاهزة، بدل تطبيقها فجأة في
// الخلفية أثناء استخدامه (registerType: 'prompt' في vite.config.js).
export default function UpdateToast() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div className="fixed inset-x-4 bottom-24 z-50 flex items-center justify-between rounded-xl border border-ledger-border bg-ledger-surface px-4 py-3 shadow-lg">
      <span className="text-sm text-ledger-text">يتوفر تحديث جديد للتطبيق</span>
      <button
        type="button"
        onClick={() => updateServiceWorker(true)}
        className="shrink-0 rounded-lg bg-ledger-accent px-3 py-1.5 text-xs font-medium text-ledger-bg"
      >
        تحديث الآن
      </button>
    </div>
  )
}
