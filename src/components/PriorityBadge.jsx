const priorityStyles = {
  Low: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  Medium: 'bg-amber-100 text-amber-700 ring-amber-200',
  High: 'bg-orange-100 text-orange-700 ring-orange-200',
  Critical: 'bg-red-100 text-red-700 ring-red-200'
}

export default function PriorityBadge({ level }) {
  const styles = priorityStyles[level] || 'bg-slate-100 text-slate-700 ring-slate-200'

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${styles}`}>
      {level}
    </span>
  )
}
