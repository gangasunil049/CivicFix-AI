import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { signOut } from '../api/auth'
import { getMyComplaints } from '../api/complaints'
import { useAuth } from '../auth/useAuth'
import AbstractPageBackground from '../components/AbstractPageBackground'
import ComplaintCard from '../components/ComplaintCard'

export default function DashboardPage() {
  const { session, user } = useAuth()
  const navigate = useNavigate()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    getMyComplaints(session?.access_token, user?.id)
      .then((items) => {
        if (active) setComplaints(items)
      })
      .catch((loadError) => {
        if (active) setError(loadError.message || 'Unable to load your reports.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [session?.access_token, user?.id])

  const handleSignOut = async () => {
    const { error: signOutError } = await signOut()
    if (signOutError) {
      setError(signOutError.message)
      return
    }
    navigate('/account', { replace: true })
  }

  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'Citizen'
  const resolvedCount = complaints.filter((complaint) => complaint.status === 'Resolved').length
  const activeCount = complaints.length - resolvedCount

  return (
    <AbstractPageBackground>
      <div className="mx-auto max-w-[1280px] space-y-8 pb-10">
        <header className="flex flex-col justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9a7000]">Citizen dashboard</p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">Welcome, {username}</h1>
            <p className="mt-1 text-sm text-slate-600">{user?.email}</p>
          </div>
          <button type="button" onClick={handleSignOut} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">
            Sign out
          </button>
        </header>

        <section aria-label="Report summary" className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Your reports</p>
            <p className="mt-2 text-3xl font-black text-slate-900">{loading ? '—' : complaints.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">In progress</p>
            <p className="mt-2 text-3xl font-black text-slate-900">{loading ? '—' : activeCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Resolved</p>
            <p className="mt-2 text-3xl font-black text-slate-900">{loading ? '—' : resolvedCount}</p>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-white">Your reports</h2>
              <p className="mt-1 text-sm text-white/70">Track updates on the issues you submitted.</p>
            </div>
            <Link to="/report" className="rounded-xl bg-[#ffbf07] px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-[#ffd04a]">Report an issue</Link>
          </div>

          {error ? <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}
          {loading ? (
            <div className="h-48 animate-pulse rounded-2xl bg-white/80" />
          ) : complaints.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {complaints.map((complaint) => <ComplaintCard key={complaint.id} complaint={complaint} />)}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/15 bg-slate-950/40 p-8 text-center text-white">
              <h3 className="text-lg font-bold">No reports yet</h3>
              <p className="mt-2 text-sm text-white/70">Reports you submit while signed in will appear here.</p>
            </div>
          )}
        </section>
      </div>
    </AbstractPageBackground>
  )
}
