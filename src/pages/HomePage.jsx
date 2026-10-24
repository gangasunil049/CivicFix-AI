import { ArrowRight, FileText, Headphones } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="relative isolate min-h-[calc(100vh-56px)] space-y-0 pb-16">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/civicfix-homepage.jpg')" }}
      />
     
<section className="relative isolate z-10 min-h-[660px] w-full overflow-hidden bg-transparent shadow-xl">
  <div className="relative z-10 mx-auto flex min-h-[660px] w-full max-w-[1280px] flex-col justify-center px-6 py-16 sm:px-10 lg:px-12">
    <div className="w-full">
      <div className="mb-7 flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-[#ffbf07]">
        <span>Cleaner Streets</span>
        <span className="text-white/60">|</span>
        <span>Safer Communities</span>
        <span className="text-white/60">|</span>
        <span>A Better Tomorrow</span>
      </div>

      <h1 className="max-w-4xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
        Together for a
        <span className="mt-2 block text-[#ffbf07]">
          Better, Safer City
        </span>
      </h1>

      <p className="mt-6 max-w-xl text-base leading-7 text-white/85 sm:text-lg">
        Report civic issues like potholes, fallen trees, broken streetlights
        and more. Help us make our city cleaner, safer and better for everyone.
      </p>

      {/* Large action cards */}
      <div className="mt-20 grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
        <Link
          to="/report"
          className="group flex min-h-[150px] items-center justify-between gap-4 rounded-2xl bg-[#ffbf07] p-5 text-slate-900 shadow-xl transition duration-300 hover:-translate-y-1 hover:bg-[#ffd04a] sm:p-6"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-[#ffbf07]">
              <FileText className="h-7 w-7" />
            </div>

            <div>
              <h2 className="text-xl font-extrabold sm:text-2xl">
                Report Issue
              </h2>
              <p className="mt-2 text-sm text-slate-800">
                Spot a problem? Let us know.
              </p>
            </div>
          </div>

          <ArrowRight className="h-6 w-6 shrink-0 transition-transform group-hover:translate-x-2" />
        </Link>

        <Link
          to="/#help-section"
          className="group flex min-h-[150px] items-center justify-between gap-4 rounded-2xl border border-white/20 bg-slate-950/90 p-5 text-white shadow-xl transition duration-300 hover:-translate-y-1 hover:bg-slate-900 sm:p-6"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
              <Headphones className="h-7 w-7" />
            </div>

            <div>
              <h2 className="text-xl font-extrabold sm:text-2xl">
                Help Desk
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Get support or track your complaint.
              </p>
            </div>
          </div>

          <ArrowRight className="h-6 w-6 shrink-0 transition-transform group-hover:translate-x-2" />
        </Link>
      </div>
    </div>
  </div>
</section>

<section className="relative z-10 flex min-h-[420px] items-center px-6 py-20 sm:px-10 lg:px-12">
  <div className="mx-auto w-full max-w-[1280px]">
    <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#ffbf07] [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">
      How CivicFix works
    </p>
    <h2 className="mt-3 max-w-3xl text-3xl font-black text-white [text-shadow:0_2px_5px_rgba(0,0,0,0.85)] sm:text-4xl">
      Small actions. Safer streets.
    </h2>

    <div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-10">
      <article className="border-t border-white/60 pt-4">
        <p className="text-sm font-bold text-[#ffbf07] [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">01 / REPORT</p>
        <p className="mt-3 max-w-sm text-base leading-7 text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.85)]">
          Share the issue, its location, and a photo so your community can act on it.
        </p>
      </article>
      <article className="border-t border-white/60 pt-4">
        <p className="text-sm font-bold text-[#ffbf07] [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">02 / REVIEW</p>
        <p className="mt-3 max-w-sm text-base leading-7 text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.85)]">
          Your report is assessed and shared with the team responsible for the area.
        </p>
      </article>
      <article className="border-t border-white/60 pt-4">
        <p className="text-sm font-bold text-[#ffbf07] [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">03 / RESOLVE</p>
        <p className="mt-3 max-w-sm text-base leading-7 text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.85)]">
          Follow progress as local issues move toward a safer, cleaner resolution.
        </p>
      </article>
    </div>
  </div>
</section>

    </div>
  )
}
