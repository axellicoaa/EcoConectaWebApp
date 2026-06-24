import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface KPIs {
  active: number
  donations: number
  sales: number
  completed: number
}

export function useKPIs() {
  const [kpis, setKpis] = useState<KPIs>({ active: 0, donations: 0, sales: 0, completed: 0 })

  async function refetch() {
    const [
      { count: active },
      { count: donations },
      { count: sales },
      { count: completed },
    ] = await Promise.all([
      supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active').eq('type', 'donation'),
      supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active').eq('type', 'sale'),
      supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    ])
    setKpis({
      active:    active    ?? 0,
      donations: donations ?? 0,
      sales:     sales     ?? 0,
      completed: completed ?? 0,
    })
  }

  useEffect(() => {
    refetch()
    const channel = supabase
      .channel('kpis-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'listings' }, refetch)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  return kpis
}
