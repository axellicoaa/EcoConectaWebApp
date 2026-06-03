import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { mapListingToEcoObject } from '../utils/ecoHelpers'
import type { EcoObject, Category, Condition } from '../types'

export function useListings() {
  const [objects, setObjects]     = useState<EcoObject[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    if (data) setCategories(data as Category[])
  }, [])

  const fetchListings = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('listings')
      .select(`
        *,
        profiles(id, full_name, username, avatar_url),
        categories(id, name, slug, icon),
        conditions(id, name, slug, description),
        listing_images(id, url, order_index)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (err) {
      setError(err.message)
    } else {
      setObjects((data ?? []).map(mapListingToEcoObject))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCategories()
    fetchListings()
  }, [fetchCategories, fetchListings])

  return { objects, categories, loading, error, refresh: fetchListings }
}

export function useConditions() {
  const [conditions, setConditions] = useState<Condition[]>([])

  useEffect(() => {
    supabase
      .from('conditions')
      .select('*')
      .order('created_at')
      .then(({ data }) => {
        if (data) setConditions(data as Condition[])
      })
  }, [])

  return conditions
}
