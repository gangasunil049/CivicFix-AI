import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { getComplaints } from '../api/complaints'
import AbstractPageBackground from '../components/AbstractPageBackground'
import ComplaintCard from '../components/ComplaintCard'

const categories = ['All', 'pothole', 'blocked_drain', 'garbage', 'broken_streetlight', 'water_leakage', 'other']
const statuses = ['All', 'Submitted', 'Under Review', 'In Progress', 'Resolved']

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [carouselPaused, setCarouselPaused] = useState(false)

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
          setError(loadError.message || 'Unable to load complaints.')
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

  const filteredComplaints = useMemo(() => {
    const query = searchTerm.toLowerCase()

    return complaints.filter((complaint) => {
      const matchesCategory = selectedCategory === 'All' || complaint.issue_type === selectedCategory
      const matchesStatus = selectedStatus === 'All' || complaint.status === selectedStatus
      const matchesSearch =
        complaint.description.toLowerCase().includes(query) ||
        complaint.address.toLowerCase().includes(query) ||
        complaint.issue_type.toLowerCase().includes(query)

      return matchesCategory && matchesStatus && matchesSearch
    })
  }, [complaints, searchTerm, selectedCategory, selectedStatus])

  useEffect(() => {
    setActiveIndex(0)
  }, [searchTerm, selectedCategory, selectedStatus])

  useEffect(() => {
    if (filteredComplaints.length < 2 || carouselPaused) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % filteredComplaints.length)
    }, 5000)

    return () => window.clearInterval(timer)
  }, [filteredComplaints.length, carouselPaused])

  if (loading) {
    return (
      <AbstractPageBackground>
        <div className="mx-auto max-w-[1400px] space-y-4">
          <div className="h-12 animate-pulse rounded-2xl bg-slate-200" />
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-52 animate-pulse rounded-3xl bg-slate-200" />
            ))}
          </div>
        </div>
      </AbstractPageBackground>
    )
  }

  return (
    <AbstractPageBackground>
      <div className="mx-auto max-w-[1400px] space-y-6 pb-10">
      <div className="mb-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/70">Complaints</p>
          <h1 className="mt-1 text-3xl font-black text-[#ffbf07]">Community reports</h1>
        </div>

      </div>

      <div className="grid gap-4 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[1.2fr_0.6fr_0.6fr]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by issue, address, or keywords"
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#ffbf07] focus:outline-none focus:ring-2 focus:ring-[#ffbf07]/30"
          />
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-[#ffbf07] focus:outline-none focus:ring-2 focus:ring-[#ffbf07]/30"
          >
            {categories.map((category) => (
              <option key={category} value={category}>{category === 'All' ? 'All categories' : category}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Status
          </label>
          <select
            value={selectedStatus}
            onChange={(event) => setSelectedStatus(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-[#ffbf07] focus:outline-none focus:ring-2 focus:ring-[#ffbf07]/30"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>{status === 'All' ? 'All statuses' : status}</option>
            ))}
          </select>
        </div>
      </div>

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

      {filteredComplaints.length ? (
        <div
          className="mx-auto w-full max-w-4xl"
          role="region"
          aria-label="Community complaints carousel"
          onMouseEnter={() => setCarouselPaused(true)}
          onMouseLeave={(event) => {
            if (!event.currentTarget.contains(document.activeElement)) setCarouselPaused(false)
          }}
          onFocus={() => setCarouselPaused(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget) && !event.currentTarget.matches(':hover')) {
              setCarouselPaused(false)
            }
          }}
        >
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out motion-reduce:transition-none"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {filteredComplaints.map((complaint, index) => (
                <div
                  key={complaint.id}
                  className="w-full shrink-0"
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`Complaint ${index + 1} of ${filteredComplaints.length}`}
                  aria-hidden={index !== activeIndex}
                  inert={index !== activeIndex}
                >
                  <ComplaintCard complaint={complaint} />
                </div>
              ))}
            </div>
          </div>

          {filteredComplaints.length > 1 ? (
            <div className="mt-4 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setActiveIndex((index) => (index - 1 + filteredComplaints.length) % filteredComplaints.length)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-slate-900 text-white transition hover:bg-slate-700"
                aria-label="Show previous complaint"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <p className="text-sm font-medium text-white/80" aria-live="polite">
                {activeIndex + 1} <span className="text-white/50">/</span> {filteredComplaints.length}
              </p>
              <button
                type="button"
                onClick={() => setActiveIndex((index) => (index + 1) % filteredComplaints.length)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-slate-900 text-white transition hover:bg-slate-700"
                aria-label="Show next complaint"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
          No complaints match your search yet. Try broadening the filters or sharing a new issue.
        </div>
      )}
      </div>
    </AbstractPageBackground>
  )
}
