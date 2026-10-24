import { supabase } from '../lib/supabase'

const requireSupabase = () => {
  if (!supabase) {
    throw new Error('Account access is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to the frontend environment.')
  }
  return supabase
}

export async function signUpWithEmail({ username, email, password }) {
  return requireSupabase().auth.signUp({
    email,
    password,
    options: {
      data: { username: username.trim() },
      emailRedirectTo: `${window.location.origin}/dashboard`,
    },
  })
}

export async function signInWithEmail({ email, password }) {
  return requireSupabase().auth.signInWithPassword({ email, password })
}

export async function signOut() {
  return requireSupabase().auth.signOut()
}
