export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ledger-bg px-6">
      <div className="w-full max-w-sm rounded-2xl border border-ledger-border bg-ledger-surface p-8 text-center">
        <h1 className="text-lg font-semibold text-ledger-text">تسجيل الدخول</h1>
        <p className="mt-2 text-sm text-ledger-muted">
          شاشة إدخال رمز PIN ستُبنى في خطوة المصادقة القادمة.
        </p>
      </div>
    </div>
  )
}
