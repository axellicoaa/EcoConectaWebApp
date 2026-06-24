import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types'
import SessionTimeoutModal from '../components/SessionTimeoutModal'

const INACTIVITY_MS = 30 * 60 * 1000  // 30 minutes
const WARNING_MS    = 25 * 60 * 1000  // warn at 25 min (5 min before logout)

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  showTimeoutWarning: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  extendSession: () => void
  updateProfile: (data: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>) => Promise<{ error: string | null }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]                     = useState<User | null>(null)
  const [session, setSession]               = useState<Session | null>(null)
  const [profile, setProfile]               = useState<Profile | null>(null)
  const [loading, setLoading]               = useState(true)
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false)

  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const logoutTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)

  function clearTimers() {
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current)
    if (logoutTimerRef.current)  clearTimeout(logoutTimerRef.current)
  }

  function resetTimers() {
    clearTimers()
    setShowTimeoutWarning(false)
    warningTimerRef.current = setTimeout(() => setShowTimeoutWarning(true), WARNING_MS)
    logoutTimerRef.current  = setTimeout(() => supabase.auth.signOut(), INACTIVITY_MS)
  }

  // Track inactivity only while a session is active
  useEffect(() => {
    if (!session) {
      clearTimers()
      setShowTimeoutWarning(false)
      return
    }

    const EVENTS = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'] as const
    EVENTS.forEach(e => window.addEventListener(e, resetTimers, { passive: true }))
    resetTimers()

    return () => {
      clearTimers()
      EVENTS.forEach(e => window.removeEventListener(e, resetTimers))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  function extendSession() {
    resetTimers()
  }

  async function fetchProfile(userId: string) {
    await supabase
      .from('profiles')
      .upsert({ id: userId }, { onConflict: 'id', ignoreDuplicates: true })

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) setProfile(data as Profile)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  async function signUp(email: string, password: string, fullName: string) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    return { error: error?.message ?? null }
  }

  async function signOut() {
    clearTimers()
    await supabase.auth.signOut()
  }

  async function updateProfile(data: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>) {
    if (!user) return { error: 'No autenticado' }
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', user.id)
    if (!error) await fetchProfile(user.id)
    return { error: error?.message ?? null }
  }

  async function refreshProfile() {
    if (user) await fetchProfile(user.id)
  }

  return (
    <AuthContext.Provider
      value={{
        user, session, profile, loading, showTimeoutWarning,
        signIn, signUp, signOut, extendSession, updateProfile, refreshProfile,
      }}
    >
      {children}
      <SessionTimeoutModal
        open={showTimeoutWarning}
        onExtend={extendSession}
        onSignOut={signOut}
      />
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
