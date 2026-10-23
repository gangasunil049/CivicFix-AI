import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'

import Navbar from './components/Navbar'
import ComplaintDetailPage from './pages/ComplaintDetailPage'
import ComplaintsPage from './pages/ComplaintsPage'
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

export default function App() {
  return (
    <BrowserRouter>
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
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
