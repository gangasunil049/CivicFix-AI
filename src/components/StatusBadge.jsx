const statusStyles = {
  Submitted: 'bg-sky-100 text-sky-700 ring-sky-200',
  'Under Review': 'bg-amber-100 text-amber-700 ring-amber-200',
  'In Progress': 'bg-indigo-100 text-indigo-700 ring-indigo-200',
  Resolved: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  Critical: 'bg-red-100 text-red-700 ring-red-200'
}

export default function StatusBadge({ status }) {
  const styles = statusStyles[status] || 'bg-slate-100 text-slate-700 ring-slate-200'

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${styles}`}>
      {status}
    </span>
  )
}
