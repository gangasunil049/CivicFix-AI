import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { to: '/#home-section', section: 'home-section', label: 'Home' },
  { to: '/#report-section', section: 'report-section', label: 'Report Issue' },
  { to: '/#complaints-section', section: 'complaints-section', label: 'All Complaints' },
  { to: '/#help-section', section: 'help-section', label: 'Help' }
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname, hash } = useLocation()

  const isActive = (section) => pathname === '/' && (hash ? hash === `#${section}` : section === 'home-section')

  return (
    <header className="sticky top-0 z-50 bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80">
      <nav className="mx-auto flex w-full max-w-[1360px] items-center justify-between px-0 py-2 sm:px-0 lg:px-0">
        <Link to="/" className="ml-0 flex shrink-0 items-center self-start" aria-label="CivicFix home">
          <img src="/logoo.jpeg" alt="CivicFix logo" className="h-16 w-[300px] object-contain md:h-20 md:w-[340px]" />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`relative px-1 py-2 text-sm font-medium transition ${
                isActive(item.section) ? 'text-[#ffbf07]' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              {item.label}
              {isActive(item.section) ? <span className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-[#ffbf07]" /> : null}
            </Link>
          ))}
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full border border-slate-200 p-2 text-slate-800 md:hidden"
          onClick={() => setMobileOpen((current) => !current)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {mobileOpen ? (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="mx-auto flex max-w-[1360px] flex-col px-4 py-3">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`rounded-xl px-3 py-2 text-sm font-medium ${
                  isActive(item.section) ? 'bg-amber-50 text-[#ffbf07]' : 'text-slate-700'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  )
}
