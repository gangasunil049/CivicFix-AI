import { ArrowRight, FileText, MessagesSquare } from 'lucide-react'
import { Link } from 'react-router-dom'

import ComplaintsPage from './ComplaintsPage'
import HomePage from './HomePage'
import ReportIssuePage from './ReportIssuePage'

export default function ScrollSitePage() {
  return (
    <>
      <section id="home-section" className="scroll-mt-16">
        <HomePage />
      </section>

      <section id="report-section" className="scroll-mt-16">
        <ReportIssuePage />
      </section>

      <section id="complaints-section" className="scroll-mt-16">
        <ComplaintsPage />
      </section>

      <footer id="help-section" className="scroll-mt-16 bg-[#ffbf07] px-6 py-20 text-slate-900 sm:px-10 lg:px-12">
        <div className="mx-auto flex max-w-[1280px] flex-col justify-between gap-10 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-5">
              <img src="/logoo-cutout.png" alt="CivicFix help desk logo" className="h-20 w-20 origin-left scale-125 object-contain" />
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-800">Help desk</p>
            </div>
            <h2 className="text-3xl font-black sm:text-4xl">Need help with a civic report?</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-800">
              Review community reports or send in an issue with its location and details.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/#complaints-section"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <MessagesSquare className="h-4 w-4" />
              View complaints
            </Link>
            <Link
              to="/#report-section"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <FileText className="h-4 w-4" />
              Report an issue
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </footer>
    </>
  )
}
