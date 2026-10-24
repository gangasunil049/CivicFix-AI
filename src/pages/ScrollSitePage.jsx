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

      <section id="help-section" className="scroll-mt-16 bg-[#17232c] px-6 py-20 text-white sm:px-10 lg:px-12">
        <div className="mx-auto flex max-w-[1280px] flex-col justify-between gap-10 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-3">
              <img src="/logoo.jpeg" alt="CivicFix help desk logo" className="h-16 w-16 object-contain" />
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#ffbf07]">Help desk</p>
            </div>
            <h2 className="text-3xl font-black sm:text-4xl">Need help with a civic report?</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/75">
              Review community reports or send in an issue with its location and details.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/#complaints-section"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <MessagesSquare className="h-4 w-4" />
              View complaints
            </Link>
            <Link
              to="/#report-section"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ffbf07] px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-[#ffd04a]"
            >
              <FileText className="h-4 w-4" />
              Report an issue
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
