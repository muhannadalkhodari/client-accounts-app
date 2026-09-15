import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage.jsx'
import HomePage from './pages/HomePage.jsx'
import { ensureAnonymousAuth } from './services/authService.js'

export default function App() {
  const [authReady, setAuthReady] = useState(false)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    ensureAnonymousAuth()
      .then(() => setAuthReady(true))
      .catch((err) => setAuthError(err.message))
  }, [])

  if (authError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ledger-bg px-6 text-center text-ledger-text">
        تعذّر الاتصال بقاعدة البيانات: {authError}
      </div>
    )
  }

  if (!authReady) {
    return <div className="min-h-screen bg-ledger-bg" />
  }

  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/home" element={<HomePage />} />
    </Routes>
  )
}
