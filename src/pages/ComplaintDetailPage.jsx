import { ArrowLeft, Clock3, MapPin } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { getComplaintById } from '../api/complaints'
import AIAnalysisCard from '../components/AIAnalysisCard'
import ComplaintMap from '../components/ComplaintMap'
import PriorityBadge from '../components/PriorityBadge'
import StatusBadge from '../components/StatusBadge'

const timelineSteps = ['Submitted', 'Under Review', 'In Progress', 'Resolved']

function formatDate(value) {
  return new Date(value).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  })
}

export default function ComplaintDetailPage() {
  const { id } = useParams()
  const [complaint, setComplaint] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const loadComplaint = async () => {
      try {
        setLoading(true)
        const data = await getComplaintById(id)
        if (active) {
          setComplaint(data)
          setError('')
        }
      } catch (loadError) {
        if (active) {
          setError(loadError.message || 'Unable to load this complaint.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadComplaint()

    return () => {
      active = false
    }
  }, [id])

  if (loading) {
    return (
      <div className="space-y-4 pb-10">
        <div className="h-12 animate-pulse rounded-2xl bg-slate-200" />
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="h-72 animate-pulse rounded-3xl bg-slate-200" />
          <div className="h-72 animate-pulse rounded-3xl bg-slate-200" />
        </div>
      </div>
    )
  }

  if (error || !complaint) {
    return (
      <div className="rounded-[2rem] border border-red-200 bg-red-50 p-5 text-red-700">
        {error || 'Complaint not found.'}
      </div>
    )
  }

  const currentStepIndex = Math.max(0, timelineSteps.indexOf(complaint.status))

  return (
    <div className="space-y-6 pb-10">
      <Link to="/complaints" className="inline-flex items-center gap-2 text-sm font-medium text-red-700 hover:text-red-800">
        <ArrowLeft className="h-4 w-4" />
        Back to all complaints
      </Link>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700">
                {complaint.issue_type}
              </span>
              <StatusBadge status={complaint.status} />
              <PriorityBadge level={complaint.ai.priority_level} />
            </div>

            <h1 className="mt-4 text-3xl font-black text-slate-900">{complaint.description}</h1>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-3">
                <div className="text-xs uppercase tracking-[0.12em] text-slate-500">Submitted</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">{formatDate(complaint.created_at)}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <div className="text-xs uppercase tracking-[0.12em] text-slate-500">Location</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">{complaint.address}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <div className="text-xs uppercase tracking-[0.12em] text-slate-500">Complaint ID</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">#{complaint.id}</div>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200">
              <img
                src={complaint.photo_url || 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80'}
                alt={complaint.issue_type}
                className="h-80 w-full object-cover"
              />
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="text-xl font-bold text-slate-900">Status timeline</h2>
            <div className="mt-5 space-y-4">
              {timelineSteps.map((step, index) => {
                const isComplete = index <= currentStepIndex
                return (
                  <div key={step} className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${isComplete ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
                      {step}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
              <MapPin className="h-5 w-5 text-red-600" />
              Location
            </div>
            <p className="mb-4 text-sm text-slate-600">{complaint.address}</p>
            <ComplaintMap complaints={[complaint]} center={[complaint.latitude, complaint.longitude]} zoom={14} />
          </div>

          <AIAnalysisCard complaint={complaint} />
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <Clock3 className="h-4 w-4 text-red-600" />
          Report information
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-3">
            <div className="text-xs uppercase tracking-[0.12em] text-slate-500">Category</div>
            <div className="mt-1 text-sm font-semibold text-slate-900">{complaint.ai.category}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3">
            <div className="text-xs uppercase tracking-[0.12em] text-slate-500">Priority</div>
            <div className="mt-1 text-sm font-semibold text-slate-900">{complaint.ai.priority_level}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
