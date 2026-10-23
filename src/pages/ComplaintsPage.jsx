import { Search, SlidersHorizontal } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { getComplaints } from '../api/complaints'
import ComplaintCard from '../components/ComplaintCard'
import ComplaintMap from '../components/ComplaintMap'

const categories = ['All', 'pothole', 'blocked_drain', 'garbage', 'broken_streetlight', 'water_leakage', 'other']
const statuses = ['All', 'Submitted', 'Under Review', 'In Progress', 'Resolved']

export default function ComplaintsPage() {
  const [view, setView] = useState('list')
  const [complaints, setComplaints] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
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

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-12 animate-pulse rounded-2xl bg-slate-200" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-52 animate-pulse rounded-3xl bg-slate-200" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">Complaints</p>
          <h1 className="mt-1 text-3xl font-black text-slate-900">Community reports</h1>
        </div>

        <div className="inline-flex rounded-full bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setView('list')}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${view === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
          >
            List view
          </button>
          <button
            type="button"
            onClick={() => setView('map')}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${view === 'map' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
          >
            Map view
          </button>
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
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
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
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
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
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>{status === 'All' ? 'All statuses' : status}</option>
            ))}
          </select>
        </div>
      </div>

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

      {view === 'list' ? (
        filteredComplaints.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredComplaints.map((complaint) => (
              <ComplaintCard key={complaint.id} complaint={complaint} />
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
            No complaints match your search yet. Try broadening the filters or sharing a new issue.
          </div>
        )
      ) : (
        filteredComplaints.length ? (
          <ComplaintMap complaints={filteredComplaints} center={[12.875, 74.845]} zoom={12} />
        ) : (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
            No reports are available on the map for the selected filters.
          </div>
        )
      )}
    </div>
  )
}
