import { ArrowRight, CheckCircle2, MapPinned, MessageSquareText, ShieldCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { getComplaints } from '../api/complaints'

const steps = [
  { title: 'Report', description: 'Share the issue, location and photo in a minute.', icon: MessageSquareText },
  { title: 'AI analyses', description: 'Our model classifies and prioritises the report.', icon: ShieldCheck },
  { title: 'Authorities act', description: 'Ward teams and departments receive a clear action brief.', icon: MapPinned },
  { title: 'Track progress', description: 'See updates, status changes and resolution timelines.', icon: CheckCircle2 }
]

export default function HomePage() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const loadComplaints = async () => {
      try {
        setLoading(true)
        const data = await getComplaints()
        if (active) {
          setComplaints(data)
          setError('')
        }
      } catch (loadError) {
        if (active) {
          setError(loadError.message || 'Unable to load platform data.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadComplaints()

    return () => {
      active = false
    }
  }, [])

  const stats = useMemo(() => {
    const total = complaints.length
    const resolved = complaints.filter((item) => item.status === 'Resolved').length
    const inProgress = complaints.filter((item) => item.status === 'In Progress' || item.status === 'Under Review').length

    return { total, resolved, inProgress }
  }, [complaints])

  return (
    <div className="space-y-12 pb-12">
      <section className="rounded-[2rem] bg-gradient-to-br from-slate-900 via-blue-950 to-blue-800 p-6 text-white shadow-xl sm:p-8 lg:p-12">
        <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-blue-100">
              Better public services, faster
            </span>
            <h1 className="mt-5 max-w-xl text-4xl font-black tracking-tight sm:text-5xl">
              Report civic problems. Get them fixed faster.
            </h1>
            <p className="mt-4 max-w-lg text-base text-slate-200 sm:text-lg">
              Citizens can report potholes, drains, garbage, streetlights and leaks in minutes, and the platform triages them with AI guidance for city teams.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                to="/report"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50"
              >
                Report an Issue
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/complaints" className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                View reports
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur-sm">
            <div className="rounded-[1.5rem] bg-white p-5 text-slate-900 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Today</div>
                  <div className="mt-2 text-3xl font-black text-slate-900">{stats.total || 0}</div>
                </div>
                <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-slate-100 p-3">
                  <div className="text-slate-500">Resolved</div>
                  <div className="mt-1 text-xl font-bold text-slate-900">{stats.resolved}</div>
                </div>
                <div className="rounded-2xl bg-slate-100 p-3">
                  <div className="text-slate-500">In progress</div>
                  <div className="mt-1 text-xl font-bold text-slate-900">{stats.inProgress}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500">Total reports</div>
          <div className="mt-3 text-3xl font-black text-slate-900">{loading ? '—' : stats.total}</div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500">Resolved</div>
          <div className="mt-3 text-3xl font-black text-emerald-600">{loading ? '—' : stats.resolved}</div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500">In progress</div>
          <div className="mt-3 text-3xl font-black text-amber-600">{loading ? '—' : stats.inProgress}</div>
        </div>
      </section>

      <section>
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">How it works</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">From issue to action</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {steps.map(({ title, description, icon: Icon }, index) => (
            <div key={title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <Icon className="h-5 w-5" />
              </div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Step {index + 1}</div>
              <h3 className="text-lg font-bold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm text-slate-600">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}
    </div>
  )
}
