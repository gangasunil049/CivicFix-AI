import { AlertTriangle, BrainCircuit, Gauge, Sparkles } from 'lucide-react'

import PriorityBadge from './PriorityBadge'

export default function AIAnalysisCard({ complaint }) {
  if (!complaint?.ai) {
    return null
  }

  const { ai } = complaint
  const confidencePct = Math.round((ai.confidence || 0) * 100)

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <BrainCircuit className="h-5 w-5 text-blue-600" />
          AI analysis
        </div>
        {ai.is_uncertain ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
            <AlertTriangle className="h-3.5 w-3.5" />
            Uncertain prediction - needs review
          </span>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
          <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
            <Sparkles className="h-3.5 w-3.5" />
            Category
          </div>
          <div className="text-sm font-semibold text-slate-900">{ai.category}</div>
        </div>

        <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
          <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
            <Gauge className="h-3.5 w-3.5" />
            Confidence
          </div>
          <div className="text-sm font-semibold text-slate-900">{confidencePct}%</div>
        </div>

        <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
          <div className="mb-1 text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
            Priority
          </div>
          <PriorityBadge level={ai.priority_level} />
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-white p-4 text-sm text-slate-600 ring-1 ring-slate-200">
        <span className="font-semibold text-slate-900">Explanation:</span> {ai.explanation}
      </div>

      {ai.possible_duplicate_of ? (
        <div className="mt-4 text-sm text-slate-600">
          Possible duplicate of <a className="font-semibold text-blue-700 hover:text-blue-800" href={`/complaints/${ai.possible_duplicate_of}`}>#{ai.possible_duplicate_of}</a>
        </div>
      ) : null}
    </div>
  )
}
