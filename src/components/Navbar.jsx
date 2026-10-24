import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { useAuth } from '../auth/useAuth'

const navItems = [
  { to: '/#home-section', section: 'home-section', label: 'Home' },
  { to: '/#report-section', section: 'report-section', label: 'Report Issue' },
  { to: '/#complaints-section', section: 'complaints-section', label: 'All Complaints' },
  { to: '/#help-section', section: 'help-section', label: 'Help' }
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname, hash } = useLocation()
  const { user } = useAuth()
  const hasVerifiedAccount = Boolean(user?.email_confirmed_at || user?.confirmed_at)

  const isActive = (section) => pathname === '/' && (hash ? hash === `#${section}` : section === 'home-section')

  return (
    <header className="sticky top-0 z-50 bg-black text-white shadow-sm ring-1 ring-white/10">
      <nav className="mx-auto flex w-full max-w-[1360px] items-center justify-between px-3 py-1 sm:px-4 lg:px-6">
        <Link to="/" className="flex shrink-0 items-center" aria-label="CivicFix home">
          <img src="/logo-white.png" alt="CivicFix logo" className="h-14 w-14 object-contain" />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`relative px-1 py-2 text-sm font-medium transition ${
                isActive(item.section) ? 'text-[#ffbf07]' : 'text-white/80 hover:text-white'
              }`}
            >
              {item.label}
              {isActive(item.section) ? <span className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-[#ffbf07]" /> : null}
            </Link>
          ))}
          <Link
            to={hasVerifiedAccount ? '/dashboard' : '/account'}
            className="rounded-lg bg-[#ffbf07] px-4 py-2 text-sm font-bold text-slate-900 transition hover:bg-[#ffd04a]"
          >
            {hasVerifiedAccount ? 'Dashboard' : 'Sign in'}
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full border border-white/15 p-2 text-white md:hidden"
          onClick={() => setMobileOpen((current) => !current)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {mobileOpen ? (
        <div className="border-t border-white/10 bg-black md:hidden">
          <div className="mx-auto flex max-w-[1360px] flex-col px-4 py-3">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`rounded-xl px-3 py-2 text-sm font-medium ${
                  isActive(item.section) ? 'bg-white/5 text-[#ffbf07]' : 'text-white/80'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to={hasVerifiedAccount ? '/dashboard' : '/account'}
              onClick={() => setMobileOpen(false)}
              className="mt-2 rounded-xl bg-[#ffbf07] px-3 py-2 text-sm font-bold text-slate-900"
            >
              {hasVerifiedAccount ? 'Dashboard' : 'Sign in'}
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  )
}
