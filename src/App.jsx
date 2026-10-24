import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'

import { AuthProvider } from './auth/AuthProvider'
import { useAuth } from './auth/useAuth'
import Navbar from './components/Navbar'
import AccountPage from './pages/AccountPage'
import ComplaintDetailPage from './pages/ComplaintDetailPage'
import ComplaintsPage from './pages/ComplaintsPage'
import DashboardPage from './pages/DashboardPage'
import ReportIssuePage from './pages/ReportIssuePage'
import ScrollSitePage from './pages/ScrollSitePage'

function ScrollToSection() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) return

    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [pathname, hash])

  return null
}

function DashboardRoute() {
  const { loading, user } = useAuth()
  const emailVerified = Boolean(user?.email_confirmed_at || user?.confirmed_at)

  if (loading) {
    return <div className="min-h-[50vh] bg-[#111827]" aria-label="Loading account" />
  }

  return user && emailVerified ? <DashboardPage /> : <Navigate to="/account" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-[#f3f1eb] text-slate-800">
          <Navbar />
          <ScrollToSection />
          <main className="w-full px-0 py-0">
            <Routes>
              <Route path="/" element={<ScrollSitePage />} />
              <Route path="/help" element={<Navigate to="/#help-section" replace />} />
              <Route path="/report" element={<ReportIssuePage />} />
              <Route path="/complaints" element={<ComplaintsPage />} />
              <Route path="/complaints/:id" element={<ComplaintDetailPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/dashboard" element={<DashboardRoute />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}
