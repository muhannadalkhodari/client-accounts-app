import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OfficeIllustration from '../components/OfficeIllustration.jsx'
import PinDots from '../components/PinDots.jsx'
import PinKeypad from '../components/PinKeypad.jsx'
import { hasPinConfigured, setupPin, checkPin } from '../services/settingsService.js'
import { markLoggedIn, hasValidSession } from '../utils/session.js'

// stage: 'loading' | 'setup-create' | 'setup-confirm' | 'verify'
export default function LoginPage() {
  const navigate = useNavigate()
  const [stage, setStage] = useState('loading')
  const [pin, setPin] = useState('')
  const [firstPinDraft, setFirstPinDraft] = useState('')
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (hasValidSession()) {
      navigate('/home', { replace: true })
      return
    }
    hasPinConfigured().then((configured) => {
      setStage(configured ? 'verify' : 'setup-create')
    })
  }, [navigate])

  function triggerError(message) {
    setError(message)
    setShake(true)
    setTimeout(() => setShake(false), 500)
    setPin('')
  }

  async function handleComplete(fullPin) {
    setError('')
    if (stage === 'setup-create') {
      setFirstPinDraft(fullPin)
      setStage('setup-confirm')
      setPin('')
      return
    }
    if (stage === 'setup-confirm') {
      if (fullPin !== firstPinDraft) {
        setFirstPinDraft('')
        setStage('setup-create')
        triggerError('الرمزان غير متطابقين، ابدأ من جديد')
        return
      }
      setBusy(true)
      await setupPin(fullPin)
      markLoggedIn()
      navigate('/home', { replace: true })
      return
    }
    if (stage === 'verify') {
      setBusy(true)
      const ok = await checkPin(fullPin)
      setBusy(false)
      if (!ok) {
        triggerError('رمز غير صحيح')
        return
      }
      markLoggedIn()
      navigate('/home', { replace: true })
    }
  }

  function handleDigit(d) {
    if (busy || pin.length >= 4) return
    const next = pin + d
    setPin(next)
    if (next.length === 4) handleComplete(next)
  }

  function handleBackspace() {
    if (busy) return
    setPin((p) => p.slice(0, -1))
  }

  if (stage === 'loading') {
    return <div className="min-h-screen bg-ledger-bg" />
  }

  const titles = {
    'setup-create': { title: 'إنشاء رمز الدخول', subtitle: 'اختر رمزاً من 4 أرقام لحماية الوصول من هذا الجهاز' },
    'setup-confirm': { title: 'تأكيد الرمز', subtitle: 'أدخل نفس الرمز مرة أخرى' },
    verify: { title: 'أهلاً بعودتك', subtitle: 'أدخل رمز الدخول' },
  }
  const { title, subtitle } = titles[stage]

  return (
    <div className="ledger-ruled-bg flex min-h-screen flex-col justify-between bg-ledger-bg px-6 py-10">
      <div className="flex flex-1 flex-col items-center justify-center gap-8">
        <OfficeIllustration className="h-32 w-auto" />

        <div className="text-center">
          <h1 className="text-lg font-semibold text-ledger-text">{title}</h1>
          <p className="mt-1 text-sm text-ledger-muted">{subtitle}</p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <PinDots filledCount={pin.length} shake={shake} />
          <p className="h-5 text-sm text-ledger-payment">{error}</p>
        </div>
      </div>

      <PinKeypad onDigit={handleDigit} onBackspace={handleBackspace} disabled={busy} />
    </div>
  )
}
