import { BrowserRouter, Route, Routes } from 'react-router-dom'

import Navbar from './components/Navbar'
import ComplaintDetailPage from './pages/ComplaintDetailPage'
import ComplaintsPage from './pages/ComplaintsPage'
import HomePage from './pages/HomePage'
import ReportIssuePage from './pages/ReportIssuePage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-100 text-slate-800">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/report" element={<ReportIssuePage />} />
            <Route path="/complaints" element={<ComplaintsPage />} />
            <Route path="/complaints/:id" element={<ComplaintDetailPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
