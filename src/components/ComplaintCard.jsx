import { Clock3, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

import PriorityBadge from './PriorityBadge'
import StatusBadge from './StatusBadge'

const categoryMeta = {
  pothole: 'Pothole',
  blocked_drain: 'Blocked Drain',
  garbage: 'Garbage',
  broken_streetlight: 'Broken Streetlight',
  water_leakage: 'Water Leakage',
  other: 'Other'
}

const categoryPhotos = {
  pothole: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
  blocked_drain: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
  garbage: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
  broken_streetlight: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=800&q=80',
  water_leakage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
  other: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=80'
}

function formatDate(value) {
  return new Date(value).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  })
}

export default function ComplaintCard({ complaint }) {
  const categoryPhoto = categoryPhotos[complaint.issue_type] || categoryPhotos.other

  return (
    <Link to={`/complaints/${complaint.id}`} className="block rounded-3xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex gap-3">
        <img
          src={complaint.photo_url || categoryPhoto}
          alt={categoryMeta[complaint.issue_type] || 'Civic issue'}
          className="h-24 w-24 rounded-2xl object-cover"
          onError={(event) => {
            const image = event.currentTarget

            if (image.dataset.fallback !== 'applied') {
              image.dataset.fallback = 'applied'
              image.src = categoryPhoto
            } else {
              image.onerror = null
              image.src = '/images/civicfix-homepage.jpg'
            }
          }}
        />

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#fff8df] px-2.5 py-1 text-[11px] font-semibold text-[#8a6100]">
              {categoryMeta[complaint.issue_type] || 'Other'}
            </span>
            <StatusBadge status={complaint.status} />
          </div>

          <p className="line-clamp-2 text-base font-semibold text-slate-900">{complaint.description}</p>

          <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate">{complaint.address}</span>
            </div>
            <PriorityBadge level={complaint.ai.priority_level} />
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" />
              {formatDate(complaint.created_at)}
            </span>
            <span className="font-medium text-slate-600">#{complaint.id}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
