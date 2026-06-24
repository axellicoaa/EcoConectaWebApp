import { useEffect, useState } from 'react'

interface CityState {
  city: string | null
  loading: boolean
}

export function useCity(): CityState {
  const [state, setState] = useState<CityState>({ city: null, loading: false })

  useEffect(() => {
    if (!navigator.geolocation) return

    setState({ city: null, loading: true })

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`,
            { headers: { 'Accept-Language': 'es', 'User-Agent': 'EcoConecta/1.0' } }
          )
          const data = await res.json()
          const city =
            data.address?.city ??
            data.address?.town ??
            data.address?.village ??
            data.address?.municipality ??
            null
          setState({ city, loading: false })
        } catch {
          setState({ city: null, loading: false })
        }
      },
      () => setState({ city: null, loading: false }),
      { timeout: 10_000, maximumAge: 300_000 }
    )
  }, [])

  return state
}
