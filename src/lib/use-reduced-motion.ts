import { useEffect, useState } from 'react'

export function useReducedMotion(): boolean {
  const query = '(prefers-reduced-motion: reduce)'
  const [value, setValue] = useState<boolean>(() => window.matchMedia(query).matches)

  useEffect(() => {
    const mq = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setValue(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return value
}
