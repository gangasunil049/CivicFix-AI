import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import { signInWithEmail, signUpWithEmail } from '../api/auth'
import { useAuth } from '../auth/useAuth'
import AbstractPageBackground from '../components/AbstractPageBackground'
import { supabaseConfigured } from '../lib/supabase'

export default function AccountPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('signin')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const emailVerified = Boolean(user?.email_confirmed_at || user?.confirmed_at)

  if (emailVerified) return <Navigate to="/dashboard" replace />

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (mode === 'signup') {
      if (!username.trim()) {
        setError('Enter a username to create your account.')
        return
      }
      if (password.length < 8) {
        setError('Use a password with at least 8 characters.')
        return
      }
      if (password !== passwordConfirmation) {
        setError('The passwords do not match.')
        return
      }
    }

    setSubmitting(true)
    try {
      if (mode === 'signup') {
        const { data, error: authError } = await signUpWithEmail({ username, email, password })
        if (authError) throw authError
        if (data.session) navigate('/dashboard', { replace: true })
        else setMessage(`We sent a confirmation link to ${email}. Confirm your email to activate your account.`)
      } else {
        const { error: authError } = await signInWithEmail({ email, password })
        if (authError) throw authError
        navigate('/dashboard', { replace: true })
      }
    } catch (authError) {
      setError(authError.message || 'Account access failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AbstractPageBackground>
      <div className="mx-auto max-w-xl pb-10">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9a7000]">CivicFix account</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">
            {mode === 'signup' ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {mode === 'signup'
              ? 'Sign up to keep track of the civic issues you report.'
              : 'Sign in to view your reported issues and their status.'}
          </p>

          {!supabaseConfigured ? (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              Account access needs Supabase configuration. Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in the frontend environment, then restart Vite.
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === 'signup' ? (
              <div>
                <label htmlFor="account-username" className="mb-1.5 block text-sm font-semibold text-slate-800">Username</label>
                <input
                  id="account-username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                  required
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-[#ffbf07] focus:outline-none focus:ring-2 focus:ring-[#ffbf07]/30"
                />
              </div>
            ) : null}

            <div>
              <label htmlFor="account-email" className="mb-1.5 block text-sm font-semibold text-slate-800">Email</label>
              <input
                id="account-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-[#ffbf07] focus:outline-none focus:ring-2 focus:ring-[#ffbf07]/30"
              />
            </div>

            <div>
              <label htmlFor="account-password" className="mb-1.5 block text-sm font-semibold text-slate-800">Password</label>
              <input
                id="account-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                minLength={mode === 'signup' ? 8 : undefined}
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-[#ffbf07] focus:outline-none focus:ring-2 focus:ring-[#ffbf07]/30"
              />
            </div>

            {mode === 'signup' ? (
              <div>
                <label htmlFor="account-password-confirmation" className="mb-1.5 block text-sm font-semibold text-slate-800">Confirm password</label>
                <input
                  id="account-password-confirmation"
                  type="password"
                  value={passwordConfirmation}
                  onChange={(event) => setPasswordConfirmation(event.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-[#ffbf07] focus:outline-none focus:ring-2 focus:ring-[#ffbf07]/30"
                />
              </div>
            ) : null}

            {error ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
            {message ? <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p> : null}

            <button
              type="submit"
              disabled={submitting || !supabaseConfigured}
              className="w-full rounded-xl bg-[#ffbf07] px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-[#ffd04a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            {mode === 'signup' ? 'Already registered?' : 'New to CivicFix?'}{' '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signup' ? 'signin' : 'signup')
                setError('')
                setMessage('')
              }}
              className="font-semibold text-slate-900 underline decoration-[#ffbf07] decoration-2 underline-offset-4"
            >
              {mode === 'signup' ? 'Sign in' : 'Create an account'}
            </button>
          </p>
          <Link to="/" className="mt-5 block text-center text-sm font-medium text-slate-500 hover:text-slate-900">Back to CivicFix</Link>
        </section>
      </div>
    </AbstractPageBackground>
  )
}
